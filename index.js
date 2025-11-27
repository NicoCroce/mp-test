import express from "express";
import cors from "cors";
import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from "mercadopago";

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
