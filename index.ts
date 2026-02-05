import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent configura el componente principal de la aplicación.
// En este caso, llama a nuestro App.tsx que ya gestiona la navegación 
// hacia la Pizarra y el resto de módulos.
registerRootComponent(App);