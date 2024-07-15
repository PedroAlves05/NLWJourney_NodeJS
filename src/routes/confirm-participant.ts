import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { request } from "http";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'
import nodemailer from 'nodemailer';
import { date, promise, z } from 'zod';
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import { create } from "domain";
import { error } from "console";
import { dayjs } from "../lib/dayjs";
import { env } from "../env";
import { ClientError } from "../errors/client-error";



export async function confirmParticipants(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get(
        '/participants/:participantId/confirm', 
        {
            schema: {
                params: z.object({
                    participantId: z.string().uuid(),
                })
            },
        }, async (request, reply) => {
            const { participantId } = request.params

            const participant = await prisma.participant.findUnique({
                where: {
                    id: participantId
                }
            })

            if(!participant) {
                throw new ClientError('Participant not found.')
            }

            if(participant.is_confirmed) {
                return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
            }

            await prisma.participant.update({
                where: { id: participantId },
                data: { is_confirmed: true },
            })

            return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
        },
    )
}