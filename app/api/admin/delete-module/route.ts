// app/api/admin/delete-module/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

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

interface AdminUser {
    role: string;
}

interface LessonData {
    id: string;
}

interface ContentData {
    id: string;
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

        // 2. Pegar o ID do módulo
        const { moduleId } = await request.json();

        if (!moduleId) {
            return NextResponse.json(
                { error: 'ID do módulo não fornecido' },
                { status: 400 }
            );
        }

        // 3. Buscar todas as lessons do módulo
        const { data: lessons } = await supabaseAdmin
            .from('lessons')
            .select('id')
            .eq('module_id', moduleId);

        const lessonIds = (lessons as LessonData[])?.map(l => l.id) || [];

        // 4. Buscar todos os contents das lessons
        let contentIds: string[] = [];
        if (lessonIds.length > 0) {
            const { data: contents } = await supabaseAdmin
                .from('lesson_contents')
                .select('id')
                .in('lesson_id', lessonIds);

            contentIds = (contents as ContentData[])?.map(c => c.id) || [];
        }

        // 5. Deletar em cascata (ordem importa!)

        // 5.1 Content-level
        if (contentIds.length > 0) {
            await supabaseAdmin.from('content_progress').delete().in('content_id', contentIds);
            await supabaseAdmin.from('exercise_submissions').delete().in('content_id', contentIds);
        }

        // 5.2 Lesson-level
        if (lessonIds.length > 0) {
            await supabaseAdmin.from('lesson_contents').delete().in('lesson_id', lessonIds);
            await supabaseAdmin.from('lesson_progress').delete().in('lesson_id', lessonIds);
            await supabaseAdmin.from('materials').delete().in('lesson_id', lessonIds);
        }

        // 5.3 Module-level
        await supabaseAdmin.from('student_notes').delete().eq('module_id', moduleId);
        await supabaseAdmin.from('lessons').delete().eq('module_id', moduleId);

        // 6. Deletar o módulo
        const { error: deleteError } = await supabaseAdmin
            .from('modules')
            .delete()
            .eq('id', moduleId);

        if (deleteError) {
            console.error('[DeleteModule] Erro:', deleteError);
            return NextResponse.json(
                { error: 'Erro ao deletar módulo' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Módulo excluído permanentemente',
            deleted: {
                lessons: lessonIds.length,
                contents: contentIds.length
            }
        });

    } catch (error) {
        console.error('[DeleteModule] Erro:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// GET para buscar estatísticas antes de deletar
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const moduleId = searchParams.get('moduleId');

        if (!moduleId) {
            return NextResponse.json(
                { error: 'ID do módulo não fornecido' },
                { status: 400 }
            );
        }

        // Buscar módulo
        const { data: module } = await supabaseAdmin
            .from('modules')
            .select('id, name')
            .eq('id', moduleId)
            .single();

        if (!module) {
            return NextResponse.json(
                { error: 'Módulo não encontrado' },
                { status: 404 }
            );
        }

        // Contar lessons
        const { count: lessonsCount } = await supabaseAdmin
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .eq('module_id', moduleId);

        // Buscar IDs das lessons para contar contents
        const { data: lessons } = await supabaseAdmin
            .from('lessons')
            .select('id')
            .eq('module_id', moduleId);

        const lessonIds = (lessons as LessonData[])?.map(l => l.id) || [];

        let contentsCount = 0;
        let progressCount = 0;

        if (lessonIds.length > 0) {
            // Contar contents
            const { count: cCount } = await supabaseAdmin
                .from('lesson_contents')
                .select('id', { count: 'exact', head: true })
                .in('lesson_id', lessonIds);
            contentsCount = cCount || 0;

            // Contar progresso de alunos
            const { count: pCount } = await supabaseAdmin
                .from('lesson_progress')
                .select('id', { count: 'exact', head: true })
                .in('lesson_id', lessonIds);
            progressCount = pCount || 0;
        }

        return NextResponse.json({
            module: module.name,
            stats: {
                lessons: lessonsCount || 0,
                contents: contentsCount,
                studentProgress: progressCount
            }
        });

    } catch (error) {
        console.error('[DeleteModule] Erro ao buscar stats:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar estatísticas' },
            { status: 500 }
        );
    }
}