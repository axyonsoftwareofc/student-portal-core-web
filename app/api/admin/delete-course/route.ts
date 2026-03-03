// app/api/admin/delete-course/route.ts
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

interface ModuleData {
    id: string;
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

        // 2. Pegar o ID do curso
        const { courseId } = await request.json();

        if (!courseId) {
            return NextResponse.json(
                { error: 'ID do curso não fornecido' },
                { status: 400 }
            );
        }

        // 3. Buscar todos os módulos do curso
        const { data: modules } = await supabaseAdmin
            .from('modules')
            .select('id')
            .eq('course_id', courseId);

        const moduleIds = (modules as ModuleData[])?.map(m => m.id) || [];

        // 4. Buscar todas as lessons dos módulos
        let lessonIds: string[] = [];
        if (moduleIds.length > 0) {
            const { data: lessons } = await supabaseAdmin
                .from('lessons')
                .select('id')
                .in('module_id', moduleIds);

            lessonIds = (lessons as LessonData[])?.map(l => l.id) || [];
        }

        // 5. Buscar todos os contents das lessons
        let contentIds: string[] = [];
        if (lessonIds.length > 0) {
            const { data: contents } = await supabaseAdmin
                .from('lesson_contents')
                .select('id')
                .in('lesson_id', lessonIds);

            contentIds = (contents as ContentData[])?.map(c => c.id) || [];
        }

        // 6. Deletar em cascata (ordem importa!)

        // 6.1 Content-level
        if (contentIds.length > 0) {
            await supabaseAdmin.from('content_progress').delete().in('content_id', contentIds);
            await supabaseAdmin.from('exercise_submissions').delete().in('content_id', contentIds);
        }

        // 6.2 Lesson-level
        if (lessonIds.length > 0) {
            await supabaseAdmin.from('lesson_contents').delete().in('lesson_id', lessonIds);
            await supabaseAdmin.from('lesson_progress').delete().in('lesson_id', lessonIds);
            await supabaseAdmin.from('materials').delete().in('lesson_id', lessonIds);
        }

        // 6.3 Module-level
        if (moduleIds.length > 0) {
            await supabaseAdmin.from('student_notes').delete().in('module_id', moduleIds);
            await supabaseAdmin.from('lessons').delete().in('module_id', moduleIds);
            await supabaseAdmin.from('modules').delete().in('id', moduleIds);
        }

        // 6.4 Course-level
        await supabaseAdmin.from('student_notes').delete().eq('course_id', courseId);
        await supabaseAdmin.from('enrollments').delete().eq('course_id', courseId);
        await supabaseAdmin.from('materials').delete().eq('course_id', courseId);
        await supabaseAdmin.from('tasks').delete().eq('course_id', courseId);

        // 7. Deletar o curso
        const { error: deleteError } = await supabaseAdmin
            .from('courses')
            .delete()
            .eq('id', courseId);

        if (deleteError) {
            console.error('[DeleteCourse] Erro:', deleteError);
            return NextResponse.json(
                { error: 'Erro ao deletar curso' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Curso excluído permanentemente',
            deleted: {
                modules: moduleIds.length,
                lessons: lessonIds.length,
                contents: contentIds.length
            }
        });

    } catch (error) {
        console.error('[DeleteCourse] Erro:', error);
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
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json(
                { error: 'ID do curso não fornecido' },
                { status: 400 }
            );
        }

        // Buscar curso
        const { data: course } = await supabaseAdmin
            .from('courses')
            .select('id, name')
            .eq('id', courseId)
            .single();

        if (!course) {
            return NextResponse.json(
                { error: 'Curso não encontrado' },
                { status: 404 }
            );
        }

        // Contar módulos
        const { count: modulesCount } = await supabaseAdmin
            .from('modules')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId);

        // Buscar IDs dos módulos
        const { data: modules } = await supabaseAdmin
            .from('modules')
            .select('id')
            .eq('course_id', courseId);

        const moduleIds = (modules as ModuleData[])?.map(m => m.id) || [];

        let lessonsCount = 0;
        let contentsCount = 0;
        let enrollmentsCount = 0;

        if (moduleIds.length > 0) {
            // Contar lessons
            const { count: lCount } = await supabaseAdmin
                .from('lessons')
                .select('id', { count: 'exact', head: true })
                .in('module_id', moduleIds);
            lessonsCount = lCount || 0;

            // Buscar IDs das lessons para contar contents
            const { data: lessons } = await supabaseAdmin
                .from('lessons')
                .select('id')
                .in('module_id', moduleIds);

            const lessonIds = (lessons as LessonData[])?.map(l => l.id) || [];

            if (lessonIds.length > 0) {
                const { count: cCount } = await supabaseAdmin
                    .from('lesson_contents')
                    .select('id', { count: 'exact', head: true })
                    .in('lesson_id', lessonIds);
                contentsCount = cCount || 0;
            }
        }

        // Contar matrículas
        const { count: eCount } = await supabaseAdmin
            .from('enrollments')
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId);
        enrollmentsCount = eCount || 0;

        return NextResponse.json({
            course: course.name,
            stats: {
                modules: modulesCount || 0,
                lessons: lessonsCount,
                contents: contentsCount,
                enrollments: enrollmentsCount
            }
        });

    } catch (error) {
        console.error('[DeleteCourse] Erro ao buscar stats:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar estatísticas' },
            { status: 500 }
        );
    }
}