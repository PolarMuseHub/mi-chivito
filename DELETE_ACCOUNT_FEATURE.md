# Funcionalidad de Eliminación de Cuenta

## Resumen

La funcionalidad "Eliminar mi cuenta" permite a los usuarios ejercer su derecho de cancelación de datos personales conforme a la **Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP)** de México.

## Cumplimiento Normativo

### Regulación Mexicana

Esta funcionalidad cumple con:

1. **LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de Particulares)**
   - Artículo 16: Derecho de Cancelación
   - Artículo 22: Ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)

2. **Lineamientos del Aviso de Privacidad**
   - Información clara sobre consecuencias de la eliminación
   - Proceso transparente e inmediato
   - Confirmación explícita del usuario

### Características de Cumplimiento

- **Transparencia**: El usuario es informado de todas las consecuencias antes de confirmar
- **Irreversibilidad**: Se advierte claramente que la acción es permanente
- **Inmediatez**: La eliminación se ejecuta de forma inmediata
- **Confirmación explícita**: Requiere escribir "ELIMINAR" para prevenir eliminaciones accidentales

## Arquitectura Técnica

### Componentes

1. **DeleteAccountModal.tsx**
   - Modal de confirmación con advertencias
   - Validación de entrada del usuario
   - Información sobre derechos del usuario

2. **Edge Function: delete-user-account**
   - Elimina datos del usuario de todas las tablas
   - Elimina la cuenta de autenticación
   - Maneja la lógica de suscripciones activas

3. **Header.tsx**
   - Botón "Eliminar mi cuenta" en el menú de usuario
   - Gestión del modal de confirmación
   - Llamada a la edge function

### Proceso de Eliminación

1. **Usuario hace clic en "Eliminar mi cuenta"**
2. **Se muestra el modal de confirmación** con:
   - Lista de datos que serán eliminados
   - Información sobre derechos del usuario
   - Campo de confirmación (escribir "ELIMINAR")
3. **Usuario confirma la acción**
4. **Edge function ejecuta**:
   - Elimina registros de `profiles`
   - Elimina registros de `user_secrets`
   - Elimina registros de `subscriptions`
   - Elimina usuario de `auth.users` (esto activa CASCADE DELETE en `transactions`)
5. **Usuario es desconectado y redirigido a la página principal**

### Datos Eliminados

Al eliminar la cuenta, se borran permanentemente:

- **Transacciones**: Todos los ingresos, gastos, deudas y ahorros
- **Perfil**: Información del perfil del usuario
- **Secretos**: Claves y datos de backup
- **Suscripciones**: Información de suscripción activa
- **Autenticación**: Cuenta de usuario completa

### Seguridad

- **Autenticación requerida**: Solo el usuario autenticado puede eliminar su propia cuenta
- **Validación de sesión**: Se verifica la sesión activa antes de proceder
- **Confirmación explícita**: Requiere escribir "ELIMINAR" para confirmar
- **Sin recuperación**: Los datos no pueden ser recuperados después de la eliminación

## Información al Usuario

El modal de confirmación incluye:

### Advertencia de Irreversibilidad
- Acción permanente e irreversible
- Lista detallada de datos que serán eliminados
- No hay posibilidad de recuperación

### Derechos del Usuario
- Conforme a la LFPDPPP
- Derecho de cancelación de datos
- Proceso inmediato
- Posibilidad de crear nueva cuenta en el futuro

### Confirmación de Cuenta
- Muestra el email de la cuenta a eliminar
- Previene eliminaciones por error

## Notas Importantes

1. **Suscripciones de Stripe**: Si el usuario tiene una suscripción activa, se registra en los logs para seguimiento manual si es necesario.

2. **Cascade Delete**: La tabla `transactions` tiene configurado `ON DELETE CASCADE`, por lo que las transacciones se eliminan automáticamente al eliminar el usuario de `auth.users`.

3. **Sin período de gracia**: La eliminación es inmediata y no hay período de espera o recuperación.

4. **Nueva cuenta**: El usuario puede crear una nueva cuenta en el futuro con el mismo email, pero no tendrá acceso a los datos anteriores.

## Acceso a la Funcionalidad

Los usuarios pueden acceder a "Eliminar mi cuenta" desde:
- Menú de usuario (icono de perfil) → "Eliminar mi cuenta"

El botón está claramente separado de otras opciones con un divisor y aparece en color rojo para indicar su naturaleza destructiva.
