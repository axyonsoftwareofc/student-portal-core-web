// app/api/admin/delete-student/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Cliente Admin com service_role (NUNCA expor no frontend!)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Tipos para as queries
interface AdminUser {
    role: string;
}

interface StudentData {
    id: string;
    email: string;
    status: string;
}

export async function DELETE(request: NextRequest) {
    try {
        // 1. Verificar se o usuário é admin
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Verificar role do admin - COM TIPO EXPLÍCITO
        const { data: adminUser, error: adminError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single<AdminUser>();

        if (adminError || !adminUser || adminUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas administradores.' },
                { status: 403 }
            );
        }

        // 2. Pegar o ID do aluno a ser deletado
        const { studentId } = await request.json();

        if (!studentId) {
            return NextResponse.json(
                { error: 'ID do aluno não fornecido' },
                { status: 400 }
            );
        }

        // 3. Buscar dados do aluno antes de deletar - COM TIPO EXPLÍCITO
        const { data: student, error: studentError } = await supabaseAdmin
            .from('users')
            .select('id, email, status')
            .eq('id', studentId)
            .single<StudentData>();

        if (studentError || !student) {
            return NextResponse.json(
                { error: 'Aluno não encontrado' },
                { status: 404 }
            );
        }

        // 4. Se o aluno está ativo, deletar do Supabase Auth primeiro
        if (student.status === 'active') {
            // Buscar usuário no Auth pelo email
            const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
            const authUser = authData?.users?.find(
                (u) => u.email?.toLowerCase() === student.email?.toLowerCase()
            );

            if (authUser) {
                const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
                    authUser.id
                );

                if (authDeleteError) {
                    console.error('[DeleteStudent] Erro ao deletar auth:', authDeleteError);
                    // Continua mesmo com erro - pode ser que não exista no auth
                }
            }
        }

        // 5. Deletar dados relacionados (em ordem por causa das foreign keys)
        const tablesToDelete = [
            'exercise_responses',
            'lesson_progress',
            'task_submissions',
            'enrollments',
            'payments',
        ];

        for (const table of tablesToDelete) {
            await supabaseAdmin
                .from(table)
                .delete()
                .eq('student_id', studentId);
            // Ignora erros - tabela pode não existir ou não ter dados
        }

        // 6. Deletar da tabela users
        const { error: deleteUserError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', studentId);

        if (deleteUserError) {
            console.error('[DeleteStudent] Erro ao deletar users:', deleteUserError);
            return NextResponse.json(
                { error: 'Erro ao deletar registro do aluno' },
                { status: 500 }
            );
        }

        console.log(`[DeleteStudent] Aluno ${student.email} deletado permanentemente`);

        return NextResponse.json({
            success: true,
            message: 'Aluno excluído permanentemente'
        });

    } catch (error) {
        console.error('[DeleteStudent] Erro:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}