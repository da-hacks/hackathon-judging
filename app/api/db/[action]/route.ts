import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    switch (action) {
      // Add your specific API endpoints here based on the action
      case 'test-connection':
        const result = await query<any[]>('SELECT version()', []);
        return NextResponse.json({ success: true, version: result[0]?.version });
        
      case 'get-projects':
        const projects = await query<any[]>('SELECT * FROM projects ORDER BY name', []);
        return NextResponse.json({ projects });
        
      case 'get-judges':
        const judges = await query<any[]>('SELECT * FROM judges ORDER BY name', []);
        return NextResponse.json({ judges });
        
      case 'get-judge-scores':
        const judgeId = searchParams.get('judgeId');
        if (!judgeId) {
          return NextResponse.json({ error: 'judgeId is required' }, { status: 400 });
        }
        
        const judgeScores = await query<any[]>(
          'SELECT * FROM rubric_scores WHERE judge_id = $1 ORDER BY timestamp DESC',
          [judgeId]
        );
        
        // Transform data for client consumption
        const scores = judgeScores.map(score => ({
          id: score.id,
          judgeId: score.judge_id,
          projectId: score.project_id,
          originality: score.originality,
          technicalComplexity: score.technical_complexity,
          impact: score.impact,
          learningCollaboration: score.learning_collaboration,
          comments: score.comments,
          timestamp: score.timestamp
        }));
        
        return NextResponse.json({ scores });
        
      case 'get-next-pair':
        const nextPairJudgeId = searchParams.get('judgeId');
        if (!nextPairJudgeId) {
          return NextResponse.json({ error: 'judgeId is required' }, { status: 400 });
        }
        
        // Get all projects
        const pairProjects = await query<any[]>('SELECT * FROM projects ORDER BY id', []);
        if (pairProjects.length < 2) {
          return NextResponse.json({ pair: null });
        }
        
        // Get already judged comparisons
        const judgedComparisons = await query<any[]>(
          'SELECT project_a_id, project_b_id FROM comparisons WHERE judge_id = $1',
          [nextPairJudgeId]
        );
        
        // Create a set of already judged pairs
        const judgedPairs = new Set();
        judgedComparisons.forEach(comp => {
          const pairKey = `${Math.min(comp.project_a_id, comp.project_b_id)}-${Math.max(comp.project_a_id, comp.project_b_id)}`;
          judgedPairs.add(pairKey);
        });
        
        // Find first pair that hasn't been judged yet
        let projectA = null;
        let projectB = null;
        
        for (let i = 0; i < pairProjects.length; i++) {
          for (let j = i + 1; j < pairProjects.length; j++) {
            const pairKey = `${Math.min(pairProjects[i].id, pairProjects[j].id)}-${Math.max(pairProjects[i].id, pairProjects[j].id)}`;
            if (!judgedPairs.has(pairKey)) {
              projectA = pairProjects[i];
              projectB = pairProjects[j];
              break;
            }
          }
          if (projectA && projectB) break;
        }
        
        if (!projectA || !projectB) {
          return NextResponse.json({ pair: null });
        }
        
        // Format the response with camelCase for client consumption
        const pair = {
          projectA: {
            id: projectA.id,
            name: projectA.name,
            description: projectA.description,
            teamMembers: projectA.team_members,
            tableNumber: projectA.table_number,
            isFinalist: projectA.is_finalist
          },
          projectB: {
            id: projectB.id,
            name: projectB.name,
            description: projectB.description,
            teamMembers: projectB.team_members,
            tableNumber: projectB.table_number,
            isFinalist: projectB.is_finalist
          }
        };
        
        return NextResponse.json({ pair });
        
      case 'get-rankings':
        // First, fetch all projects
        const rankingProjects = await query<any[]>('SELECT * FROM projects ORDER BY table_number', []);
        
        // Then fetch all comparisons for ranking calculation
        const rankingComparisons = await query<any[]>('SELECT * FROM comparisons', []);
        
        // Calculate win rates for each project
        const rankingWinCounts: Record<number, number> = {};
        const rankingTotalComparisons: Record<number, number> = {};
        
        // Initialize win counts and total comparisons for each project
        rankingProjects.forEach(project => {
          rankingWinCounts[project.id] = 0;
          rankingTotalComparisons[project.id] = 0;
        });
        
        // Count wins and total comparisons
        rankingComparisons.forEach(comparison => {
          if (comparison.winner_id) {
            rankingWinCounts[comparison.winner_id] += 1;
          }
          
          // Count participation in comparisons
          if (comparison.project_a_id) {
            rankingTotalComparisons[comparison.project_a_id] += 1;
          }
          
          if (comparison.project_b_id) {
            rankingTotalComparisons[comparison.project_b_id] += 1;
          }
        });
        
        // Calculate win rate for each project
        const rankings = rankingProjects.map(project => {
          const totalComparisonsForProject = rankingTotalComparisons[project.id] || 0;
          const winRate = totalComparisonsForProject > 0 
            ? (rankingWinCounts[project.id] || 0) / totalComparisonsForProject 
            : 0;
            
          return {
            project: {
              id: project.id,
              name: project.name,
              description: project.description,
              teamMembers: project.team_members,
              tableNumber: project.table_number,
              isFinalist: project.is_finalist
            },
            score: winRate
          };
        });
        
        // Sort by win rate descending
        rankings.sort((a, b) => b.score - a.score);
        
        return NextResponse.json({ rankings });
        
      case 'get-rubric-scores':
        const projectId = searchParams.get('projectId');
        if (!projectId) {
          return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
        }
        
        const scoresResult = await query<any[]>(`
          SELECT 
            AVG(originality) as originality, 
            AVG(technical_complexity) as technical_complexity, 
            AVG(impact) as impact, 
            AVG(learning_collaboration) as learning_collaboration,
            (AVG(originality) + AVG(technical_complexity) + AVG(impact) + AVG(learning_collaboration)) / 4 as overall
          FROM rubric_scores 
          WHERE project_id = $1
          GROUP BY project_id
        `, [projectId]);
        
        if (scoresResult.length === 0) {
          return NextResponse.json({
            scores: {
              originality: 0,
              technicalComplexity: 0,
              impact: 0,
              learningCollaboration: 0,
              overall: 0
            }
          });
        }
        
        return NextResponse.json({
          scores: {
            originality: parseFloat(scoresResult[0].originality) || 0,
            technicalComplexity: parseFloat(scoresResult[0].technical_complexity) || 0,
            impact: parseFloat(scoresResult[0].impact) || 0,
            learningCollaboration: parseFloat(scoresResult[0].learning_collaboration) || 0,
            overall: parseFloat(scoresResult[0].overall) || 0
          }
        });

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error(`API Error (${params.action}):`, error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = await params;
    const body = await request.json();
    
    switch (action) {
      // Add your specific API endpoints here based on the action
      case 'add-project':
        const { name, description, team_members, table_number } = body;
        const result = await query<any[]>(
          'INSERT INTO projects (name, description, team_members, table_number, is_finalist) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [name, description, team_members, table_number, false]
        );
        return NextResponse.json({ project: result[0] });
      
      case 'update-project':
        const { id: projectUpdateId, name: projectName, description: projectDesc, team_members: teamMembers, table_number: tableNumber } = body;
        const updateResult = await query<any[]>(
          'UPDATE projects SET name = $1, description = $2, team_members = $3, table_number = $4 WHERE id = $5 RETURNING *',
          [projectName, projectDesc, teamMembers, tableNumber, projectUpdateId]
        );
        return NextResponse.json({ project: updateResult[0] });
      
      case 'delete-project':
        const { id: projectDeleteId } = body;
        await query('DELETE FROM projects WHERE id = $1', [projectDeleteId]);
        return NextResponse.json({ success: true });
      
      case 'add-judge':
        const { name: judgeName, email } = body;
        const judgeResult = await query<any[]>(
          'INSERT INTO judges (name, email) VALUES ($1, $2) RETURNING *',
          [judgeName, email]
        );
        return NextResponse.json({ judge: judgeResult[0] });
      
      case 'delete-judge':
        const { id: judgeId } = body;
        await query<any[]>('DELETE FROM judges WHERE id = $1', [judgeId]);
        return NextResponse.json({ success: true });
      
      case 'add-comparison':
        const { judge_id, project_a_id, project_b_id, winner_id, timestamp } = body;
        
        // Insert the comparison
        const comparisonResult = await query<any[]>(
          `INSERT INTO comparisons (judge_id, project_a_id, project_b_id, winner_id, timestamp)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [judge_id, project_a_id, project_b_id, winner_id, timestamp || Date.now()]
        );
        
        return NextResponse.json({ comparison: comparisonResult[0] });
      
      case 'add-rubric-score':
        const { 
          judge_id: rubricJudgeId, 
          project_id, 
          originality, 
          technical_complexity, 
          impact, 
          learning_collaboration, 
          comments,
          timestamp: scoreTimestamp 
        } = body;
        
        // Check if a score already exists for this judge and project
        const existingScore = await query<any[]>(
          'SELECT id FROM rubric_scores WHERE judge_id = $1 AND project_id = $2',
          [rubricJudgeId, project_id]
        );
        
        let scoreResult;
        if (existingScore.length > 0) {
          // Update existing score
          scoreResult = await query<any[]>(
            `UPDATE rubric_scores 
             SET originality = $1, technical_complexity = $2, impact = $3, learning_collaboration = $4, comments = $5, timestamp = $6
             WHERE judge_id = $7 AND project_id = $8 RETURNING *`,
            [originality, technical_complexity, impact, learning_collaboration, comments, scoreTimestamp, rubricJudgeId, project_id]
          );
        } else {
          // Insert new score
          scoreResult = await query<any[]>(
            `INSERT INTO rubric_scores 
             (judge_id, project_id, originality, technical_complexity, impact, learning_collaboration, comments, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [rubricJudgeId, project_id, originality, technical_complexity, impact, learning_collaboration, comments, scoreTimestamp]
          );
        }
        
        return NextResponse.json({ score: scoreResult[0] });
      
      case 'set-finalists':
        const { count } = body;
        
        // First, reset all projects as non-finalists
        await query('UPDATE projects SET is_finalist = false', []);
        
        // Get projects sorted by rankings
        const finalistProjects = await query<any[]>('SELECT * FROM projects ORDER BY name', []);
        const finalistComparisons = await query<any[]>('SELECT * FROM comparisons', []);
        
        // Calculate win rates for each project (same logic as in get-rankings)
        const finalistWinCounts: Record<number, number> = {};
        const finalistTotalComparisons: Record<number, number> = {};
        
        finalistProjects.forEach(project => {
          finalistWinCounts[project.id] = 0;
          finalistTotalComparisons[project.id] = 0;
        });
        
        finalistComparisons.forEach(comparison => {
          if (comparison.winner_id) {
            finalistWinCounts[comparison.winner_id] += 1;
          }
          
          if (comparison.project_a_id) {
            finalistTotalComparisons[comparison.project_a_id] += 1;
          }
          
          if (comparison.project_b_id) {
            finalistTotalComparisons[comparison.project_b_id] += 1;
          }
        });
        
        const finalistRankings = finalistProjects.map(project => {
          const totalComparisonsForProject = finalistTotalComparisons[project.id] || 0;
          const winRate = totalComparisonsForProject > 0 
            ? (finalistWinCounts[project.id] || 0) / totalComparisonsForProject 
            : 0;
            
          return {
            project: project,
            score: winRate
          };
        });
        
        // Sort by win rate descending
        finalistRankings.sort((a, b) => b.score - a.score);
        
        // Mark top N projects as finalists
        const finalistIds = finalistRankings.slice(0, count).map(r => r.project.id);
        
        if (finalistIds.length > 0) {
          const placeholders = finalistIds.map((_, index) => `$${index + 1}`).join(', ');
          await query(
            `UPDATE projects SET is_finalist = true WHERE id IN (${placeholders})`,
            finalistIds
          );
        }
        
        // Return the list of finalists
        const finalists = await query<any[]>(
          'SELECT * FROM projects WHERE is_finalist = true ORDER BY name',
          []
        );
        
        return NextResponse.json({ finalists });
        
      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error(`API Error (${params.action}):`, error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 