import express,{ Express } from "express";
import cors from "cors";

const app: Express = express();

app.use(cors()); //para habilitar cors
app.use(express.json());

//localhost:8000/
app.use("/...", ruta);

app.listen(8000, () => {
    console.log("El servidor esta corriendo en el puerto 8000")
})




