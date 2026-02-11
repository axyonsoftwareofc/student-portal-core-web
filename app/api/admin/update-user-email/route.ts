// app/api/admin/update-user-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { error: 'Configuração do servidor incompleta' },
                { status: 500 }
            );
        }

        // Criar cliente com service role - configuração explícita
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            db: {
                schema: 'public',
            },
            global: {
                headers: {
                    Authorization: `Bearer ${serviceRoleKey}`,
                },
            },
        });

        // 1. Pegar o token do header para identificar quem está fazendo a requisição
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: currentUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !currentUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Verificar se é admin - usando query direta via REST
        const adminCheckResponse = await fetch(
            `${supabaseUrl}/rest/v1/users?id=eq.${currentUser.id}&select=role`,
            {
                headers: {
                    'apikey': serviceRoleKey,
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const adminCheckData = await adminCheckResponse.json();

        if (!adminCheckData || adminCheckData.length === 0 || adminCheckData[0].role !== 'admin') {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas administradores podem alterar emails.' },
                { status: 403 }
            );
        }

        // 2. Pegar dados do body
        const body = await request.json();
        const { userId, newEmail } = body as { userId: string; newEmail: string };

        if (!userId || !newEmail) {
            return NextResponse.json({ error: 'userId e newEmail são obrigatórios' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
        }

        const normalizedEmail = newEmail.toLowerCase().trim();

        // 3. Verificar se o novo email já existe (via REST)
        const existingCheckResponse = await fetch(
            `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(normalizedEmail)}&id=neq.${userId}&select=id`,
            {
                headers: {
                    'apikey': serviceRoleKey,
                    'Authorization': `Bearer ${serviceRoleKey}`,
                },
            }
        );

        const existingData = await existingCheckResponse.json();
        if (existingData && existingData.length > 0) {
            return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 });
        }

        // 4. Buscar status do usuário (via REST)
        const targetUserResponse = await fetch(
            `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=status`,
            {
                headers: {
                    'apikey': serviceRoleKey,
                    'Authorization': `Bearer ${serviceRoleKey}`,
                },
            }
        );

        const targetUserData = await targetUserResponse.json();
        if (!targetUserData || targetUserData.length === 0) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const userStatus = targetUserData[0].status;

        // 5. Se usuário está pending, só atualizar na tabela
        if (userStatus === 'pending') {
            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/users?id=eq.${userId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': serviceRoleKey,
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify({
                        email: normalizedEmail,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );

            if (!updateResponse.ok) {
                console.error('Erro ao atualizar:', await updateResponse.text());
                return NextResponse.json({ error: 'Erro ao atualizar email' }, { status: 500 });
            }

            return NextResponse.json({ success: true, message: 'Email atualizado com sucesso' });
        }

        // 6. Se usuário está active, atualizar no Auth também
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { email: normalizedEmail }
        );

        if (authUpdateError) {
            console.error('Erro ao atualizar no Auth:', authUpdateError);
            return NextResponse.json({ error: 'Erro ao atualizar email na autenticação' }, { status: 500 });
        }

        // Atualizar na tabela users
        const updateResponse = await fetch(
            `${supabaseUrl}/rest/v1/users?id=eq.${userId}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': serviceRoleKey,
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                    email: normalizedEmail,
                    updated_at: new Date().toISOString(),
                }),
            }
        );

        if (!updateResponse.ok) {
            console.error('Erro ao atualizar tabela:', await updateResponse.text());
            return NextResponse.json({ error: 'Erro ao sincronizar email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Email atualizado com sucesso' });

    } catch (error) {
        console.error('Erro inesperado:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}