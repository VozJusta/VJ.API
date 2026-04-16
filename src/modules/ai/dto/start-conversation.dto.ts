import { IsNotEmpty, IsString } from "class-validator";

export class StartConversationDTO {

    @IsString()
    @IsNotEmpty({ message: 'O campo message é obrigatório' })
    message: string
}