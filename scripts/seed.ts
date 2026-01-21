
// scripts/seed.ts
// Script para migrar datos del frontend al backend
// Ejecutar con: npx ts-node scripts/seed.ts

const INDUCTION_VIDEOS = [
    {
        title: 'Reducir, Reutilizar y Reciclar',
        category: 'Tutorial',
        duration: '3:45',
        // thumbnail is optional, frontend will derive it
        views: 1200,
        xpPoints: 10,
        completionXP: 15,
        videoUrl: 'https://www.youtube.com/watch?v=cvakvfXj0KE',
        description: 'Aprende las 3R del reciclaje: Reducir, Reutilizar y Reciclar para mejorar el mundo.',
        isActive: true,
    },
    {
        title: 'Separación de Residuos',
        category: 'Tutorial',
        duration: '2:30',
        views: 856,
        xpPoints: 10,
        completionXP: 15,
        videoUrl: 'https://www.youtube.com/watch?v=uaI3PLmAJyM',
        description: 'Guía práctica para separar correctamente los residuos en tu hogar.',
        isActive: true,
    },
    {
        title: 'El ciclo del reciclaje',
        category: 'Reciclaje',
        duration: '4:15',
        views: 2100,
        xpPoints: 12,
        completionXP: 18,
        videoUrl: 'https://www.youtube.com/watch?v=cvakvfXj0KE',
        description: 'Descubre el proceso completo del reciclaje de materiales.',
        isActive: true,
    },
    {
        title: 'Beneficios del reciclaje',
        category: 'Eco-Tips',
        duration: '3:00',
        views: 945,
        xpPoints: 8,
        completionXP: 12,
        videoUrl: 'https://www.youtube.com/watch?v=uaI3PLmAJyM',
        description: 'Impacto positivo del reciclaje en el medio ambiente.',
        isActive: true,
    },
    {
        title: 'Cómo canjear tus puntos',
        category: 'Premios',
        duration: '2:45',
        views: 1500,
        xpPoints: 15,
        completionXP: 25,
        videoUrl: 'https://www.youtube.com/watch?v=cvakvfXj0KE',
        description: 'Conoce el catálogo de premios y cómo reclamarlos con tus puntos XP.',
        isActive: true,
    },
    {
        title: 'Compostaje en casa',
        category: 'Eco-Tips',
        duration: '5:20',
        views: 678,
        xpPoints: 12,
        completionXP: 20,
        videoUrl: 'https://www.youtube.com/watch?v=uaI3PLmAJyM',
        description: 'Aprende a hacer compost con residuos orgánicos y reduce tu huella.',
        isActive: true,
    },
];

const PARTNERS = [
    {
        name: 'Nos Planét',
        filterType: 'corporate',
        typeLabel: 'Plataforma',
        logo: 'https://ui-avatars.com/api/?name=Nos+Planet&background=0D8ABC&color=fff&rounded=true&size=128',
        mainColor: '#00695C',
        description: 'Beneficios exclusivos en la plataforma. Suscripciones y más.',
        environmentalCommitment: 'Nuestra misión es democratizar el reciclaje y hacer que cada acción cuente. Trabajamos para crear una economía circular donde los residuos se conviertan en recursos.',
        rewardsCount: 1,
        usersCount: 5234,
        isPinned: true,
    },
    {
        name: 'Yape',
        filterType: 'financial',
        typeLabel: 'Fintech',
        logo: 'https://ui-avatars.com/api/?name=Yape&background=6C3FB5&color=fff&rounded=true&size=128',
        mainColor: '#6C3FB5',
        description: 'Beneficios en recargas y cashback directo. Canjea tus puntos por saldo.',
        environmentalCommitment: 'Yape promueve una economía sin efectivo, reduciendo la huella de carbono asociada a la impresión y transporte de billetes.',
        rewardsCount: 2,
        usersCount: 1245,
    },
    {
        name: 'BCP',
        filterType: 'financial',
        typeLabel: 'Banco',
        logo: 'https://ui-avatars.com/api/?name=BCP&background=002C77&color=fff&rounded=true&size=128',
        mainColor: '#002C77',
        description: 'Descuentos exclusivos en servicios bancarios y bonos de apertura.',
        environmentalCommitment: 'BCP ha implementado una estrategia de sostenibilidad que incluye financiamiento verde y reducción de huella de carbono.',
        rewardsCount: 2,
        usersCount: 856,
    },
    {
        name: 'Municipalidad Local',
        filterType: 'government',
        typeLabel: 'Gobierno',
        logo: 'https://ui-avatars.com/api/?name=Muni&background=D32F2F&color=fff&rounded=true&size=128',
        mainColor: '#D32F2F',
        description: 'Acceso a talleres municipales y certificaciones ambientales oficiales.',
        environmentalCommitment: 'Compromiso con la implementación de políticas públicas de gestión de residuos, cumpliendo con la Ley General de Residuos Sólidos.',
        rewardsCount: 2,
        usersCount: 2134,
    },
    {
        name: 'Reforesta Perú',
        filterType: 'ong',
        typeLabel: 'ONG Ambiental',
        logo: 'https://ui-avatars.com/api/?name=Reforesta&background=0288D1&color=fff&rounded=true&size=128',
        mainColor: '#0288D1',
        description: 'Contribuye a la reforestación. Cada canje planta árboles nativos.',
        environmentalCommitment: 'Recuperar los ecosistemas degradados mediante la plantación de especies nativas, generando sumideros de carbono.',
        rewardsCount: 1,
        usersCount: 3421,
    },
    {
        name: 'Patitas Felices',
        filterType: 'ong',
        typeLabel: 'ONG Social',
        logo: 'https://ui-avatars.com/api/?name=Patitas&background=FF8A65&color=fff&rounded=true&size=128',
        mainColor: '#FF8A65',
        description: 'Ayuda a albergues de animales rescatados con tus canjes.',
        environmentalCommitment: 'Promovemos la tenencia responsable y el concepto de economía circular: residuos reciclables por alimento.',
        rewardsCount: 1,
        usersCount: 1876,
    },
];

const BASE_URL = 'http://localhost:3000/api';

async function seed() {
    console.log('🌱 Starting seeding process...');

    // 1. Seed Inductions
    console.log('\n--- Seeding Inductions ---');
    for (const item of INDUCTION_VIDEOS) {
        try {
            const response = await fetch(`${BASE_URL}/induction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Created Induction: ${data.title}`);
            } else {
                console.error(`❌ Failed to create ${item.title}:`, await response.text());
            }
        } catch (error) {
            console.error(`❌ Error creating ${item.title}:`, error.message);
        }
    }

    // 2. Seed Partners
    console.log('\n--- Seeding Partners ---');
    for (const item of PARTNERS) {
        try {
            const response = await fetch(`${BASE_URL}/partners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Created Partner: ${data.name}`);
            } else {
                console.error(`❌ Failed to create ${item.name}:`, await response.text());
            }
        } catch (error) {
            console.error(`❌ Error creating ${item.name}:`, error.message);
        }
    }

    console.log('\n✨ Seeding completed!');
}

seed();
