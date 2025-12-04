export enum RecyclingStatus {
    PENDING = 'PENDING',     // Creado, esperando reciclador
    ACCEPTED = 'ACCEPTED',   // Reciclador va en camino
    REJECTED = 'REJECTED',   // Reciclador rechazó (opcional)
    COMPLETED = 'COMPLETED', // Entregado y puntos asignados
}