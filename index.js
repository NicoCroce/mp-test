import express from "express";
import cors from "cors";
import { MercadoPagoConfig, PreApprovalPlan, PreApproval,  } from "mercadopago";

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  // Reemplaza YOUR_ACCESS_TOKEN por tu token o usa process.env.ACCESS_TOKEN
  accessToken:
    "TEST-4025359772954609-112511-4b508203309dc7f645c8d628e01add1d-65594592",
  // Establecer el país (Argentina)
  options: { timeout: 5000, maxRetries: 3, nationalId: "AR" },
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

const preApprovalClient = new PreApproval(client);

// Rutas
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API" });
});

// Endpoint: POST /api/create-subscription
app.post("/api/create-subscription", async (req, res) => {
  try {
    const { preapproval_plan_id, external_reference, payer_email } = req.body;

    // Validar campos requeridos
    if (!preapproval_plan_id || !external_reference || !payer_email) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos",
        required: ["preapproval_plan_id", "external_reference", "payer_email"]
      });
    }

    // Crear la suscripción
    const subscriptionData = {
      preapproval_plan_id: preapproval_plan_id,
      reason: "Suscripción GLOOUDS mensual",
      external_reference: external_reference,
      payer_email: payer_email,
      back_url: "https://app.gloouds.com/login",
      status: "pending"
    };

    const subscription = await preApprovalClient.create({ body: subscriptionData });

    console.log(`Suscripción creada exitosamente. ID: ${subscription.id}`);

    return res.status(201).json({
      success: true,
      subscription_id: subscription.id,
      init_point: subscription.init_point,
      status: subscription.status,
      data: subscription
    });

  } catch (error) {
    console.error("Error al crear la suscripción:", error.message);
    return res.status(500).json({ 
      error: "Error al crear la suscripción",
      message: error.message 
    });
  }
});

// Endpoint: POST /webhooks/mercadopago
app.post("/webhooks/mercadopago", async (req, res) => {
  // 1. Mercado Pago envía la notificación
  const data = req.body;
  const preapprovalId = data.data.id; // ID de la Suscripción (Preapproval)

  console.log(`Estes es el ID de la solicitud:  ${preapprovalId}`);

  try {
    // https://github.com/mercadopago/sdk-nodejs/blob/master/src/examples/preApproval/get.ts
    const preapproval = await preApprovalClient.get({ id: preapprovalId });

    console.log(`Datos de sub: ${JSON.stringify(preapproval)}`);

    // Lógica de negocio (Actualización de base de datos)
    console.log(`Webhook de Suscripción recibido. ID: ${preapprovalId}`);
  } catch (error) {
    console.error(
      "Error al procesar webhook o buscar preapproval:",
      error.message
    );
  }

  res.status(200).send();
});






// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
