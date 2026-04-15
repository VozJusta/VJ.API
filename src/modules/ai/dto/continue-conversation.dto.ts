import { IsNotEmpty, IsString } from "class-validator";

export class ContinueConversationDto {

    @IsString()
    @IsNotEmpty({ message: 'O campo conversationId é obrigatório' })
    conversationId: string;

    @IsString()
    @IsNotEmpty({ message: 'O campo message é obrigatório' })
    message: string;
}