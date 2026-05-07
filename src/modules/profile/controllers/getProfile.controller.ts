import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ShowProfileService } from '@m/profile/service/showProfile.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class GetProfileController {
    constructor(private readonly showProfile: ShowProfileService) {}

    @Get()
    @UseGuards(AuthTokenGuardAccess)
    @ApiOperation({
        summary: 'Retorna o perfil autenticado',
        description:
            'Busca e retorna o perfil do usuário autenticado conforme a role definida no token.',
    })
    @ApiResponse({
        status: 200,
        description: 'Perfil retornado com sucesso.',
        schema: {
            oneOf: [
                {
                    example: {
                        id: '47ff0575-8976-4316-877d-936a2b1d478c',
                        full_name: 'Pedro Sales',
                        email: 'pedro@gmail.com',
                        cpf: '123.456.789-00',
                        avatar_image: 'https://cdn.example.com/profiles/citizen/avatar.png',
                        phone: '11 99999-9999',
                    },
                },
                {
                    example: {
                        id: '9fbe6cc4-1f90-4df3-8dd2-6eb36747c512',
                        full_name: 'Thiago Menezes',
                        bio: 'Advogado focado em direito tributário e empresarial.',
                        cpf: '123.456.789-00',
                        avatar_image: 'https://cdn.example.com/profiles/lawyer/avatar.png',
                        specialization: 'Tax',
                        lawyer_status: 'Ativo',
                        oab_number: '123456/SP',
                        oab_state: 'SP',
                        phone: '11 99999-9999',
                        email: 'thiago@gmail.com',
                    },
                },
            ],
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Token ausente, inválido ou expirado.',
        schema: {
            example: {
                statusCode: 401,
                message: 'Token inválido',
                error: 'Unauthorized',
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'Role não autorizada para acessar o perfil.',
        schema: {
            example: {
                statusCode: 403,
                message: 'Role não autorizada para acessar o perfil',
                error: 'Forbidden',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Perfil não encontrado para o usuário autenticado.',
        schema: {
            example: {
                statusCode: 404,
                message: 'Cidadão não encontrado',
                error: 'Not Found',
            },
        },
    })
    @ApiInternalServerErrorResponse({
        description: 'Erro inesperado ao consultar o perfil.',
        schema: {
            example: {
                statusCode: 500,
                message: 'Erro interno do servidor',
                error: 'Internal Server Error',
            },
        },
    })
    async getProfile(@Req() req: RequestUser) {
        const userId = req.user.sub;
        const role = req.user.role;

        return this.showProfile.showProfileByRole(userId, role);
    }
}