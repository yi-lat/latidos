// ============================================
// CONFIGURACIÓN DE FIREBASE (TUS DATOS)
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyAi-mdZ6bxvuWYiqliA1Z43IW6nQ0AWFSw",
    authDomain: "latidos-val.firebaseapp.com",
    projectId: "latidos-val",
    storageBucket: "latidos-val.firebasestorage.app",
    messagingSenderId: "960236339362",
    appId: "1:960236339362:web:21024e098eb2e159c257fb"
};

// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ============================================
// PUNTOS DE INTERÉS (TUS 5 PUNTOS)
// ============================================
const puntosDeInteres = [
    {
        nombre: "Plaza Bolívar",
        descripcion: "El corazón histórico de Valencia. Rodeada de edificios coloniales, árboles centenarios y la estatua del Libertador. Punto de encuentro y memoria patria.",
        audio: "plaza-bolivar.mp3"
    },
    {
        nombre: "Catedral de Valencia",
        descripcion: "Templo religioso con más de 400 años de historia. Mezcla de estilos arquitectónicos: renacentista, barroco y neoclásico. Un lugar de paz y recogimiento.",
        audio: "catedral.mp3"
    },
    {
        nombre: "Museo de Artes Vivas Alexis Mújica",
        descripcion: "Espacio dedicado al arte vivo y la creatividad. Un museo que respira y se transforma. Ideal para conectar con el alma artística de Valencia.",
        audio: "museo-alexis-mujica.mp3"
    },
    {
        nombre: "Teatro Municipal",
        descripcion: "Joyas arquitectónica del siglo XIX. Un teatro neoclásico que ha sido testigo de la mejor cultura venezolana. Sus puertas cuentan historias.",
        audio: "teatro-municipal.mp3"
    },
    {
        nombre: "Plaza Bicentenario",
        descripcion: "🎨 Punto final del recorrido. Aquí realizaremos la actividad 'Pinta tu Latido': dibuja o pinta tu lugar favorito de la ruta. Lleva tu recuerdo en colores.",
        audio: "plaza-bicentenario.mp3"
    }
];

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
async function registrarUsuario(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        alert(`¡Bienvenido/a ${result.user.email}! Tu cuenta ha sido creada.`);
        return true;
    } catch (error) {
        alert("Error: " + traducirError(error.code));
        return false;
    }
}

async function iniciarSesion(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        alert(`¡Bienvenido/a ${result.user.email}!`);
        return true;
    } catch (error) {
        alert("Error: " + traducirError(error.code));
        return false;
    }
}

async function iniciarConGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        alert(`¡Bienvenido/a ${result.user.displayName || result.user.email}!`);
        return true;
    } catch (error) {
        alert("Error al iniciar con Google: " + error.message);
        return false;
    }
}

async function cerrarSesion() {
    try {
        await signOut(auth);
        alert("Has cerrado sesión");
        return true;
    } catch (error) {
        alert("Error al cerrar sesión: " + error.message);
        return false;
    }
}

function traducirError(codigo) {
    const errores = {
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/invalid-email': 'Correo electrónico inválido',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta'
    };
    return errores[codigo] || 'Error desconocido';
}

// ============================================
// FUNCIONES DE BASE DE DATOS
// ============================================
async function guardarComentario(comentario, usuarioEmail) {
    if (!comentario.trim()) {
        alert("Escribe un comentario");
        return false;
    }
    try {
        await addDoc(collection(db, "comentarios"), {
            texto: comentario,
            usuario: usuarioEmail,
            fecha: serverTimestamp()
        });
        alert("Comentario guardado. ¡Gracias por tu opinión!");
        document.getElementById("comentarioTexto").value = "";
        cargarComentarios();
        return true;
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al guardar el comentario");
        return false;
    }
}

async function cargarComentarios() {
    const contenedor = document.getElementById("comentariosLista");
    if (!contenedor) return;
    
    contenedor.innerHTML = "<p>Cargando comentarios...</p>";
    
    try {
        const q = query(collection(db, "comentarios"), orderBy("fecha", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            contenedor.innerHTML = "<p>No hay comentarios aún. ¡Sé el primero en opinar!</p>";
            return;
        }
        
        let html = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const fecha = data.fecha?.toDate() || new Date();
            html += `
                <div class="comentario">
                    <strong>${data.usuario || "Anónimo"}</strong>
                    <small>${fecha.toLocaleDateString()}</small>
                    <p>${data.texto}</p>
                </div>
            `;
        });
        contenedor.innerHTML = html;
    } catch (error) {
        console.error("Error cargando comentarios:", error);
        contenedor.innerHTML = "<p>Error al cargar comentarios</p>";
    }
}

// ============================================
// RENDERIZAR PUNTOS DE INTERÉS
// ============================================
function renderizarPuntos() {
    const grid = document.getElementById("puntosGrid");
    if (!grid) return;
    
    let html = "";
    puntosDeInteres.forEach((punto, index) => {
        html += `
            <div class="tarjeta">
                <h3>${punto.nombre}</h3>
                <p>${punto.descripcion}</p>
                <button class="btn-audio" data-audio="${punto.audio}">
                    🎧 Escuchar Audioguía
                </button>
            </div>
        `;
    });
    grid.innerHTML = html;
    
    document.querySelectorAll('.btn-audio').forEach(btn => {
        btn.addEventListener('click', function() {
            const audioFile = this.getAttribute('data-audio');
            const audio = new Audio(`audios/${audioFile}`);
            audio.play().catch(e => console.log("Error reproduciendo audio:", e));
        });
    });
}

// ============================================
// CONTROL DE INTERFAZ SEGÚN SESIÓN
// ============================================
function actualizarUIporSesion(user) {
    const loginPanel = document.getElementById("loginPanel");
    const registerPanel = document.getElementById("registerPanel");
    const loggedInPanel = document.getElementById("loggedInPanel");
    const userEmailSpan = document.getElementById("userEmail");
    const nuevoComentarioDiv = document.getElementById("nuevoComentario");
    const loginParaComentar = document.getElementById("loginParaComentar");
    
    if (user) {
        if (loginPanel) loginPanel.style.display = "none";
        if (registerPanel) registerPanel.style.display = "none";
        if (loggedInPanel) loggedInPanel.style.display = "block";
        if (userEmailSpan) userEmailSpan.textContent = user.email;
        if (nuevoComentarioDiv) nuevoComentarioDiv.style.display = "block";
        if (loginParaComentar) loginParaComentar.style.display = "none";
        cargarComentarios();
    } else {
        if (loginPanel) loginPanel.style.display = "block";
        if (registerPanel) registerPanel.style.display = "none";
        if (loggedInPanel) loggedInPanel.style.display = "none";
        if (nuevoComentarioDiv) nuevoComentarioDiv.style.display = "none";
        if (loginParaComentar) loginParaComentar.style.display = "block";
        cargarComentarios();
    }
}

// ============================================
// CONFIGURACIÓN DE EVENTOS
// ============================================
function setupEventListeners() {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const googleBtn = document.getElementById("googleBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const showRegisterBtn = document.getElementById("showRegisterBtn");
    const showLoginBtn = document.getElementById("showLoginBtn");
    const enviarComentario = document.getElementById("enviarComentarioBtn");
    
    if (loginBtn) {
        loginBtn.onclick = () => {
            const email = document.getElementById("loginEmail")?.value;
            const password = document.getElementById("loginPassword")?.value;
            if (email && password) iniciarSesion(email, password);
            else alert("Completa todos los campos");
        };
    }
    
    if (registerBtn) {
        registerBtn.onclick = () => {
            const email = document.getElementById("registerEmail")?.value;
            const password = document.getElementById("registerPassword")?.value;
            if (email && password) registrarUsuario(email, password);
            else alert("Completa todos los campos");
        };
    }
    
    if (googleBtn) {
        googleBtn.onclick = () => iniciarConGoogle();
    }
    
    if (logoutBtn) {
        logoutBtn.onclick = () => cerrarSesion();
    }
    
    if (showRegisterBtn) {
        showRegisterBtn.onclick = () => {
            document.getElementById("loginPanel").style.display = "none";
            document.getElementById("registerPanel").style.display = "block";
        };
    }
    
    if (showLoginBtn) {
        showLoginBtn.onclick = () => {
            document.getElementById("registerPanel").style.display = "none";
            document.getElementById("loginPanel").style.display = "block";
        };
    }
    
    if (enviarComentario) {
        enviarComentario.onclick = () => {
            const user = auth.currentUser;
            if (user) {
                const comentario = document.getElementById("comentarioTexto")?.value;
                guardarComentario(comentario, user.email);
            } else {
                alert("Inicia sesión para comentar");
            }
        };
    }
}

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/latidos/sw.js').catch(err => {
            console.log("Error al registrar Service Worker:", err);
        });
    });
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderizarPuntos();
    setupEventListeners();
    onAuthStateChanged(auth, (user) => {
        actualizarUIporSesion(user);
    });
});