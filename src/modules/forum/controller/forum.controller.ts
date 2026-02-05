import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, NotFoundException, UnauthorizedException, Delete } from '@nestjs/common';
import { ForumService } from '../service/forum.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePostDto } from '../dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from '../dto/create-commet.dto';

@ApiTags('Forum')
@Controller('forum')
@ApiBearerAuth()
export class ForumController {
    constructor(private readonly forumService: ForumService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Crear un nuevo post en el foro' })
    create(@Body() createPostDto: CreatePostDto, @Request() req) {

        // 👇 1. MIRA LA CONSOLA DEL SERVIDOR CUANDO HAGAS LA PETICIÓN
        console.log('DEBUG USER:', req.user);

        // 👇 2. USA ESTA LÍNEA PARA OBTENER EL ID DE FORMA SEGURA
        const userId = req.user.id || req.user.userId || req.user._id || req.user.sub;

        if (!userId) {
            throw new Error('No se pudo identificar el ID del usuario en el token');
        }

        return this.forumService.create(createPostDto, userId);
    }
    @Get()
    @ApiOperation({ summary: 'Obtener todos los posts (Feed)' })
    findAll() {
        return this.forumService.findAll();
    }

    @Patch(':id/like')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Dar o quitar like a un post' })
    toggleLike(@Param('id') id: string, @Request() req) {
        // 👇 AGREGA ESTO IGUAL QUE EN 'create'
        const userId = req.user.id || req.user.userId || req.user._id || req.user.sub;

        // Validación de seguridad extra
        if (!userId) {
            throw new UnauthorizedException('No se pudo obtener el ID del usuario');
        }

        return this.forumService.toggleLike(id, userId);
    }
    @Post('comment')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Agregar un comentario a un post' })
    addComment(@Body() body: CreateCommentDto, @Request() req) {
        // body debe tener { postId: "...", content: "..." }
        const userId = req.user.id || req.user.userId || req.user._id || req.user.sub;
        return this.forumService.addComment(userId, body);
    }

    @Get(':id/comments')
    @ApiOperation({ summary: 'Ver los comentarios de un post específico' })
    getComments(@Param('id') postId: string) {
        return this.forumService.findCommentsByPost(postId);
    }

    @Get('my-posts')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Ver solo mis posts' })
    findMyPosts(@Request() req) {
        const userId = req.user.id || req.user.userId || req.user._id || req.user.sub;
        return this.forumService.findByAuthor(userId);
    }

    @Delete(':id') // 👈 Usamos el decorador DELETE
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Eliminar un post (Solo el autor)' })
    deletePost(@Param('id') id: string, @Request() req) {
        const userId = req.user.id || req.user.userId || req.user._id || req.user.sub;
        return this.forumService.deletePost(id, userId);
    }
}