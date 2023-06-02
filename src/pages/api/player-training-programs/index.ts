import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { authorizationValidationMiddleware, errorHandlerMiddleware } from 'server/middlewares';
import { playerTrainingProgramValidationSchema } from 'validationSchema/player-training-programs';
import { convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId } = await getServerSession(req);
  switch (req.method) {
    case 'GET':
      return getPlayerTrainingPrograms();
    case 'POST':
      return createPlayerTrainingProgram();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getPlayerTrainingPrograms() {
    const data = await prisma.player_training_program
      .withAuthorization({
        userId: roqUserId,
      })
      .findMany(convertQueryToPrismaUtil(req.query, 'player_training_program'));
    return res.status(200).json(data);
  }

  async function createPlayerTrainingProgram() {
    await playerTrainingProgramValidationSchema.validate(req.body);
    const body = { ...req.body };

    const data = await prisma.player_training_program.create({
      data: body,
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(authorizationValidationMiddleware(handler))(req, res);
}
