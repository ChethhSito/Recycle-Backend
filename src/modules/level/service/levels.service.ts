import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Level, LevelDocument } from '../schema/levels.schema';

@Injectable()
export class LevelsService implements OnModuleInit {
    constructor(
        @InjectModel(Level.name) private levelModel: Model<LevelDocument>
    ) { }

    async onModuleInit() {
        const count = await this.levelModel.countDocuments();
        if (count === 0) {
            await this.seedLevels();
        }
    }

    async getLevelStatus(currentPoints: number) {
        // 1. Traemos todos los niveles ordenados
        const allLevels = await this.levelModel.find().sort({ levelNumber: 1 }).exec();

        if (!allLevels || allLevels.length === 0) return null;

        // 2. Buscamos en qué nivel cae el usuario según sus puntos
        // (Buscamos el último nivel cuyo minPoints sea menor o igual a los puntos actuales)
        const currentLevel = allLevels.find(l => currentPoints >= l.minPoints && currentPoints <= l.maxPoints)
            || allLevels[allLevels.length - 1]; // Si tiene mil millones de puntos, le damos el último nivel

        // 3. Buscamos el siguiente nivel
        const nextLevel = allLevels.find(l => l.levelNumber === currentLevel.levelNumber + 1);

        // 4. Calculamos porcentaje de progreso (0 a 1)
        // Fórmula: (PuntosActuales - MinNivel) / (MaxNivel - MinNivel)
        let progress = 0;
        if (nextLevel) {
            const range = currentLevel.maxPoints - currentLevel.minPoints;
            const pointsInLevel = currentPoints - currentLevel.minPoints;
            progress = range > 0 ? (pointsInLevel / range) : 1;
        } else {
            progress = 1; // Si es nivel máximo, barra llena
        }

        // 5. Devolvemos el objeto bonito para el frontend
        return {
            currentLevel: {
                name: currentLevel.name,
                icon: currentLevel.iconName,
                color: currentLevel.primaryColor,
                bgColor: currentLevel.bgColor,
                rank: `Nivel ${currentLevel.levelNumber}`
            },
            nextLevel: {
                name: nextLevel ? nextLevel.name : 'Nivel Máximo',
                pointsRequired: nextLevel ? nextLevel.minPoints : currentPoints
            },
            progress: parseFloat(progress.toFixed(2)), // Redondeamos a 2 decimales (ej: 0.66)
            points: {
                current: currentPoints,
                max: currentLevel.maxPoints
            }
        };
    }

    async seedLevels() {
        const levels = [
            {
                levelNumber: 1,
                name: 'Semilla de Cambio',
                iconName: 'seed',
                primaryColor: '#5D4037',
                bgColor: '#F5E6D3', // Beige Tierra
                description: 'Todo gran cambio comienza pequeño.',
                longDescription: 'Estás dando el primer paso vital. Como una semilla, llevas dentro el potencial de un futuro más verde. ¡Sigue reciclando para germinar!',
                minPoints: 0,
                maxPoints: 400,
            },
            {
                levelNumber: 2,
                name: 'Raíz Profunda',
                iconName: 'grass',
                primaryColor: '#4E342E',
                bgColor: '#E6D0B3', // Tierra Oscura
                description: 'Tus valores se están afianzando.',
                longDescription: 'Antes de crecer hacia arriba, creces hacia adentro. Tus hábitos de reciclaje están creando una base sólida y resistente.',
                minPoints: 401,
                maxPoints: 800,
            },
            {
                levelNumber: 3,
                name: 'Brote Verde',
                iconName: 'sprout',
                primaryColor: '#33691E',
                bgColor: '#D9F2C3', // Verde Lima
                description: 'Tus acciones salen a la luz.',
                longDescription: '¡Ya eres visible! Tus primeros esfuerzos han roto la superficie. Tu compromiso con el planeta empieza a ser notorio.',
                minPoints: 801,
                maxPoints: 1200,
            },
            {
                levelNumber: 4,
                name: 'Tallo Robusto',
                iconName: 'flower-tulip',
                primaryColor: '#1B5E20',
                bgColor: '#B8E6C9', // Verde Menta
                description: 'Resiliencia y constancia.',
                longDescription: 'Nada te detiene. Tu constancia te ha convertido en un pilar fundamental. Tu tallo es fuerte y capaz de soportar desafíos.',
                minPoints: 1201,
                maxPoints: 2000,
            },
            {
                levelNumber: 5,
                name: 'Rama Fuerte',
                iconName: 'spa',
                primaryColor: '#004D40',
                bgColor: '#8CD4B6', // Verde Medio
                description: 'Tu influencia se expande.',
                longDescription: 'Empiezas a ramificarte. Tu ejemplo alcanza a amigos y familiares, extendiendo la cultura del reciclaje más allá de ti mismo.',
                minPoints: 2001,
                maxPoints: 2800,
            },
            {
                levelNumber: 6,
                name: 'Árbol Guardián',
                iconName: 'tree',
                primaryColor: '#006064',
                bgColor: '#5CB8A7', // Verde Azulado
                description: 'Das sombra y protección.',
                longDescription: 'Has madurado. Eres un referente en tu comunidad, ofreciendo protección al medio ambiente y enseñando con el ejemplo.',
                minPoints: 2801,
                maxPoints: 4400,
            },
            {
                levelNumber: 7,
                name: 'Bosque Viviente',
                iconName: 'pine-tree',
                primaryColor: '#00332C',
                bgColor: '#408573', // Verde Bosque Profundo
                description: 'Eres un ecosistema de cambio.',
                longDescription: 'Has alcanzado la cima. Eres un líder, un ecosistema en sí mismo que nutre y sostiene la vida a su alrededor. ¡Eres leyenda!',
                minPoints: 4401,
                maxPoints: 6000,
            },
        ];

        // Borramos los anteriores para evitar duplicados si cambias algo y reinicias
        // (Opcional, pero recomendado en desarrollo)
        await this.levelModel.deleteMany({});

        await this.levelModel.insertMany(levels);
        console.log('✅ Niveles creados exitosamente');
    }
    // Método para que el frontend obtenga la lista
    async findAll() {
        return this.levelModel.find().sort({ levelNumber: 1 }).exec();
    }
}