import { NextRequest, NextResponse } from 'next/server';
import { getTeamData, saveTeamData } from '@/lib/services/teamService.server';

export const runtime = 'nodejs';

/**
 * GET /api/team?uid=xxx
 * Get team data for a user context
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json(
                { error: 'uid is required' },
                { status: 400 }
            );
        }

        const teamData = await getTeamData(uid);

        return NextResponse.json({
            success: true,
            teamData,
        });
    } catch (error) {
        console.error('Error in GET /api/team:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team data' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/team
 * Save/Update team data
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid, teamData } = body;

        if (!uid || !teamData) {
            return NextResponse.json(
                { error: 'uid and teamData are required' },
                { status: 400 }
            );
        }

        const success = await saveTeamData(uid, teamData);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to save team data' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in POST /api/team:', error);
        return NextResponse.json(
            { error: 'Failed to save team data' },
            { status: 500 }
        );
    }
}
