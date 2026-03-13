# Fidely - Resumen de Documentación

## Stack Tecnológico
- **Frontend:** Next.js (React) con SSR
- **Base de datos:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Auth:** Supabase Auth + whitelist manual
- **Hosting:** Vercel (frontend) + Supabase cloud (DB)
- **Pagos:** A definir fase 2 (Stripe o Mercado Pago)

---

## Modelo Multi-Local
Cada restaurante opera en un entorno completamente aislado:
- Login exclusivo con sus credenciales
- Base de clientes propia (sin datos compartidos entre locales)
- Configuración independiente de productos, sorteos, cupones, regalos y encuestas
- Reportes y métricas exclusivas por local

---

## Sistema de Whitelist
No hay registro público. El acceso es controlado manualmente:
1. El equipo Fidely da de alta al local desde el panel de administración global
2. Se generan y envían las credenciales al responsable
3. Se activa prueba gratuita de **30 días**
4. Al vencer, el acceso se suspende hasta confirmar suscripción paga (~$40.000 ARS/mes)

---

## Módulos

### Clientes
- Campos: Nombre, Apellido, DNI (obligatorio/identificador), Teléfono, Email, Fecha de nacimiento, Fecha de alta
- Puntos y visitas calculados automáticamente
- Regla de conversión configurable (ej: $100 = 1 punto)

### Tienda de Puntos
- El empleado opera en nombre del cliente (búsqueda por DNI)
- Catálogo de productos con foto, nombre, descripción y costo en puntos
- Canje descuenta puntos automáticamente
- Historial de canjes por cliente

### Regalos por Visitas
- El local define hitos (ej: visita 5, 10, 20)
- Al alcanzar un hito, se asigna un regalo automáticamente
- El empleado ve y marca como entregado el regalo
- Tipos: producto gratis, descuento, cupón, beneficio personalizado

### Cupones
- Tipos: % descuento, monto fijo, producto gratis, beneficio personalizado
- Asignación individual o por grupos (ej: clientes con más de X visitas)
- Un cupón solo puede usarse una vez
- El empleado los marca como utilizados

### Sorteos
- El local crea sorteos con nombre, descripción, premio, fecha de cierre y tipo de participación
- Participación: gratuita o con costo en puntos
- El local ve participantes y ejecuta el sorteo desde el panel
- Se registra el ganador en el sistema

### Encuestas
- Preguntas de opción múltiple, escala o texto libre
- Recompensa automática al completar: puntos, cupón, participación en sorteo, regalo
- El empleado abre la encuesta en pantalla del cliente
- El local ve resultados agregados

---

## Panel de Administración
| Sección | Funciones |
|---|---|
| Clientes | Alta, edición, búsqueda, baja, historial completo |
| Catálogo de puntos | Agregar/editar/eliminar productos canjeables |
| Cupones | Crear, asignar a clientes o grupos, ver estado |
| Sorteos | Crear, gestionar inscripciones, ejecutar, registrar ganador |
| Regalos | Configurar hitos de visitas, ver pendientes de entrega |
| Encuestas | Crear, configurar recompensas, ver resultados |
| Regla de puntos | Definir conversión monto → puntos |
| Reportes | Visitas, canjes, cupones, sorteos, encuestas |
| Mi cuenta | Datos del local, contraseña, estado de suscripción |

---

## Flujos Principales

### Alta de nuevo cliente
1. Empleado accede al panel de administración
2. Clic en "Nuevo cliente"
3. Ingresa nombre, apellido y DNI (+ datos opcionales)
4. Cliente queda con 0 puntos y 0 visitas

### Atención en caja (visita del cliente)
1. Empleado busca al cliente por DNI desde "Acceder a aplicación"
2. Ingresa el monto de la compra
3. Sistema calcula y suma puntos automáticamente
4. Contador de visitas +1
5. Si corresponde regalo por visitas, aparece aviso
6. Se pueden aplicar cupones disponibles en el mismo momento

### Canje en tienda de puntos
1. Empleado busca al cliente y accede a la tienda de puntos
2. Cliente elige un producto del catálogo
3. Empleado confirma el canje
4. Puntos se descuentan y se registra en el historial
