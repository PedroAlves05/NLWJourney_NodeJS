import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { request } from "http";
import nodemailer from 'nodemailer';
import { date, z } from 'zod';
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import { create } from "domain";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";


export async function getParticipants(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/participants', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: { 
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_confirmed: true,
                    }
                },
            },
        })

        if(!trip){
            throw new ClientError('Trip not found.')
        }

        
        return { participants: trip.participants }
    })
}