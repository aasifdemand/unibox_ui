import * as z from 'zod';

export const getCampaignSchema = (t) => {

    return z
        .object({
            name: z.string().min(3, t('campaigns.err_name_min')).max(100),
            subject: z.string().min(5, t('campaigns.err_subject_min')).max(150),
            previewText: z.string().max(200, t('campaigns.err_preview_too_long')).optional(),
            htmlBody: z.string().optional(),
            textBody: z.string().optional(),
            senderId: z.string().optional(),
            senderIds: z.array(z.string()).min(1, t('campaigns.no_sender_selected')),
            senderType: z.enum(['gmail', 'outlook', 'smtp']),
            listBatchId: z.string().min(1, t('campaigns.no_list_selected')),
            scheduleType: z.enum(['now', 'later']),
            scheduledAt: z.string().optional(),
            timezone: z.string().default('UTC'),
            throttlePerMinute: z.number().min(1).max(100).default(10),
            trackOpens: z.boolean().default(true),
            trackClicks: z.boolean().default(true),
            unsubscribeLink: z.boolean().default(true),
            sendingDays: z
                .array(z.string())
                .default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
            startTime: z.string().default('09:00'),
            endTime: z.string().default('18:00'),
            sendingInterval: z.number().min(1).default(20),
            maxLeadsPerDay: z.number().min(1).default(100),
            startDate: z.string().optional().nullable(),
            steps: z
                .array(
                    z.object({
                        stepOrder: z.number(),
                        subject: z.string().min(5, t('campaigns.err_subject_min')).max(150),
                        htmlBody: z.string().min(1, t('campaigns.err_content_req')),
                        textBody: z.string().optional(),
                        delayMinutes: z.number().min(1),
                        condition: z.enum(['always', 'no_reply']),
                    }),
                )
                .optional(),
        })
        .refine(
            (data) => {
                // Custom validation: Either htmlBody or textBody must be provided
                return data.htmlBody?.trim().length > 0 || data.textBody?.trim().length > 0;
            },
            {
                message: t('campaigns.err_content_req'),
                path: ['htmlBody'],
            },
        );
}
