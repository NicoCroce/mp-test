import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from 'mercadopago';

const app = express();
const PORT = process.env.PORT || 3000;

const PK = "TEST-23e274fe-2c46-48da-bb3c-3d944904c70c";

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({ 
    // Reemplaza YOUR_ACCESS_TOKEN por tu token o usa process.env.ACCESS_TOKEN
    accessToken: "TEST-4025359772954609-112511-4b508203309dc7f645c8d628e01add1d-65594592",
    // Establecer el país (Argentina)
    options: { timeout: 5000, maxRetries: 3, nationalId: "AR" } 
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

const preapprovalPlanClient = new PreApprovalPlan(client);
const preApprovalClient = new PreApproval(client);

async function createSubscriptionPlan() {
    const plan_data = {
        reason: 'Suscripción GLOOUDS mensual',
        // El `back_url` es CRUCIAL. Es a donde Mercado Pago redirige al usuario.
        back_url: 'https://app.gloouds.com/login',
        auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 100, // Monto en ARS (ejemplo)
            currency_id: 'ARS',
        },
    };

    try {
        const plan = await preapprovalPlanClient.create({ body: plan_data });
        const planId = plan.id;
        
        console.log(`Plan Creado Exitosamente. ID: ${planId}`);
        // ⚠️ Guarda planId en tu configuración o DB y úsalo en la siguiente ruta.
        return planId;

    } catch (error) {
        console.error('Error al crear el Plan:', error.message);
        throw error;
    }
}

// Descomenta y ejecuta esta función manualmente o a través de un script para obtener el ID.
//createSubscriptionPlan();

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Ruta de prueba GET',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/test', (req, res) => {
  res.json({ 
    message: 'Ruta de prueba POST',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

// Endpoint: POST /api/generate-link
app.post('/api/generate-link', async (req, res) => {
    // ⚠️ Reemplaza con el ID_PLAN que obtuviste en el paso anterior.
    const PLAN_ID = "42bc5205b0374db9b638d104aa7ad0bb";
    
    // Opcional: Obtener el ID de usuario desde el frontend para referencia externa
    const { user_id } = req.body; 

    if (!PLAN_ID) {
        return res.status(500).json({ error: 'PLAN_ID no configurado en el backend.' });
    }

    // Checkout Pro para suscripciones usa la URL base + preapproval_plan_id
    let checkout_url = `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=${PLAN_ID}`;
    
    // Si tienes un user_id, agrégalo para que Mercado Pago te lo devuelva en el Webhook
    if (user_id) {
        checkout_url += `&external_reference=${user_id}`;
    }

    // Devuelve la URL a React para que pueda redirigir
    return res.status(200).json({ checkout_url: checkout_url });
});

// Endpoint: POST /webhooks/mercadopago
app.post('/webhooks/mercadopago', async (req, res) => {

  console.log('------------------------------------------')
  console.log('------------------------------------------')
  console.log('------------------------------------------')
  
  console.log(JSON.stringify(req.body))
    // 1. Mercado Pago envía la notificación
    const data = req.body;
    
    // 2. Por seguridad, verifica el tipo de notificación  data.type === 'payment'
        const preapprovalId = data.id; // ID de la Suscripción (Preapproval)

        try {
            // 3. Opcional pero recomendado: Llama a la API de MP para obtener la información completa
            // https://github.com/mercadopago/sdk-nodejs/blob/master/src/examples/preApproval/get.ts
            const preapproval = await preApprovalClient.get({ id: preapprovalId });

            console.log(`Datos de sub: ${preapproval}`)
            
            // 4. Lógica de negocio (Actualización de base de datos)
            console.log(`Webhook de Suscripción recibido. ID: ${preapprovalId}`);
            // - Busca el 'external_reference' para identificar a tu usuario.
            // - Actualiza el estado de la suscripción del usuario a 'Activa' o 'Cancelada'.

        } catch (error) {
            console.error('Error al procesar webhook o buscar preapproval:', error.message);
        }

    // 5. ¡CRUCIAL! Siempre responde con 200 OK a Mercado Pago, sin importar la lógica interna.
    res.status(200).send();
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
