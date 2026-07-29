# Upatanet — Guía de Contexto y Buenas Prácticas para Agentes de IA

> **Lectura obligatoria antes de escribir cualquier código.** Este documento es la fuente única de verdad del proyecto móvil Upatanet. Cualquier agente que trabaje en este repositorio debe asimilarlo por completo.

---

## 0. Stack y versiones críticas

| Tecnología | Versión exacta |
|---|---|
| Expo SDK | `~54.0.34` |
| React Native | `0.81.5` |
| React | `19.1.0` |
| expo-router | `~6.0.23` (file-based routing) |
| TypeScript | `~5.9.2` |
| Node ≥ 18 | requerido por SDK 54 |

**Documentación oficial de referencia:** https://docs.expo.dev/versions/v54.0.0/
Antes de usar cualquier API de Expo, **verifica contra esa URL** que la firma y los nombres exportados no hayan cambiado en SDK 54.

**Path alias configurado:** `@/*` → `./` (raíz del proyecto `upatanet/`).
Ejemplo: `import { CATEGORIES } from '@/data/categories';`

**Package manager:** npm (existe `package-lock.json`). NO mezclar con pnpm/yarn.

---

## 1. Propósito del Proyecto

**Upatanet** es una plataforma móvil de impacto social y sanitario dirigida a comunidades indígenas aisladas de la Amazonía y la región de Guayana (Venezuela). La app es utilizada por representantes comunitarios para reportar incidencias en tiempo real, rastrear amenazas geográficas y coordinar ayuda con redes médicas, humanitarias y logísticas.

El foco principal es la **usabilidad en zonas con conectividad inestable**, lo que implica:
- Modales de confirmación críticos para evitar interacciones accidentales.
- Flujos Offline-first en futuras fases (mock local por ahora).
- UI clara, orgánica y culturalmente contextualizada.

---

## 2. Sistema de Diseño (Mobile UI)

### Paleta de colores (extraída de los SVGs de Figma)

| Constante | HEX | Uso |
|---|---|---|
| `background` | `#F2ECE0` | Fondo principal hueso/crema |
| `surfaceTop` | `#F6F0E3` | Cabecera de pantallas |
| `surfaceAlt` | `#FCFCFF` | Barra de estado |
| `primary` | `#C43B26` | Botones principales, bordes activos, terracota |
| `primaryDark` | `#E3361C` | Variante rojo para botón "Sí" en modal salir |
| `chipBg` | `#DFDAD0` | Chips de categoría inactivos |
| `chipBgActive` | `#C5AB92` (alpha 0.6) | Chip seleccionado |
| `textDark` | `#1C1C1E` | Texto sobre fondos claros |
| `textInverse` | `#F2ECE0` | Texto sobre modales oscuros |
| `modalBg` | `#1C1C1E` | Caja de modales |
| `modalButtonGray` | `#3A3A3C` | Botón "No" en modal publicar |
| `success` | `#3E9558` | Botón "No" verde en modal salir |
| `categorySalud` | `#C43B26` | Icono Salud (gota) |
| `categoryInsumos` | `#1D4E89` | Icono Insumos (caja) |
| `categoryNaturaleza` | `#3B6E4A` | Icono Naturaleza (hoja) |
| `categoryAlertas` | `#E8A13C` | Icono Alertas (triángulo) |
| `borderSubtle` | `#A58B70` (alpha 0.25) | Bordes sutiles (tabs) |
| `placeholderText` | `#8A8378` | Labels y placeholders |

> **ESTOS COLORES SON OBLIGATORIOS.** No inventar variantes. Cualquier color usado en código debe estar en esta tabla. Si necesitas uno nuevo, añádelo aquí primero y documentalo.

### Tipografía
- Fuente serif estilizada para títulos de pantalla (`Publicar noticia`, `Upatanet`) — usar `fontFamily: 'serif'` con `fontWeight: 'bold'`.
- Sans-serif del sistema para textos de UI.
- Tamaños extraídos de los SVGs:
  - Label de campo: `fontSize: 10`
  - Texto de botón principal: `fontSize: 16`, `fontWeight: '600'`
  - Título de header: `fontSize: 18`, `fontWeight: 'bold'`
  - Mensaje de modal: `fontSize: 16`, `lineHeight: 22`
  - Mensaje de error bajo campo: `fontSize: 11`

### Radios y medidas comunes
- Botón principal de acción: `height: 47, borderRadius: 23.5, width: 225`
- Chip de categoría: `height: 41, borderRadius: 20.5`
- Caja de modal: `width: 291, height: 297, borderRadius: 20`
- Botones de modal: `width: 100, height: 35, borderRadius: 17.5`
- Header: `height: 66`
- Tabs inferiores: `height: 80, borderRadius: 25`

### Icons
- En Android/web usar `@expo/vector-icons/MaterialIcons` vía el mapping existente en `components/ui/icon-symbol.tsx`.
- Para íconos vectoriales únicos del diseño (isotipo, etc.) se debe usar `react-native-svg` con `react-native-svg-transformer` (ver sección 5).

---

## 3. Arquitectura de Pantallas (mapa global)

La app usa **expo-router** con estructura:

```
app/
├─ _layout.tsx              Root Stack (forzar tema claro custom)
├─ (tabs)/
│  ├─ _layout.tsx           Bottom Tabs: Noticias | Mapa | Alarma | Configuración
│  ├─ index.tsx             Noticias (feed — fase 1: mini-esqueleto)
│  ├─ mapa.tsx              Placeholder
│  ├─ Alarma.tsx          Placeholder
│  └─ configuracion.tsx     Placeholder
└─ publicar.tsx             Pantalla modal de Publicación de Noticia (fase 1)
```

**Navegación:**
- El Root Stack declara `(tabs)` y `publicar` (con `presentation: 'modal'`).
- La navegación a `/publicar` se abre como modal slide-up desde la pestaña News.
- `router.back()` cierra y descarta el modal.

### Vista de alcance por fase
- **Fase 1 (actual):** Publicación de Noticia + 2 modales (Publicar, Salir) + mini-esqueleto de Home.
- **Futuras fases:** Home real con feed de tarjetas, Detalle de noticia con likes/dislikes, Mapa con pins, Mensajería (chats + conversación), Perfil/Configuración con modal "Guardar cambios".

---

## 4. Módulos funcionales (referencia, no todos implementados aún)

### A. Splash Screen
Fondo hueso con isotipo centrado (mandala étnico + perfil indígena + red de nodos azul). Variantes: limpia y con nombre "UPATANET" en serif azul oscuro.

### B. Noticias (Feed Principal)
Feed cronológico vertical de tarjetas con título grande en color de categoría, extracto, fecha y chip de categoría. Top App Bar con isotipo, "Upatanet" y dos botones circulares (upload terracota, editar). Tabs: `{Noticias, Mapa, Alarma, Configuración}`.

### C. Detalle de Noticia
Cabecera con nombre del reportero, cuerpo en contenedor redondeado, dos botones Like/Dislike con contadores (auditoría comunitaria descentralizada).

### D. Crear Publicación (FASE 1)
Formulario con título, cuerpo multilinea, 4 chips de categoría (salud/inssumos/naturaleza/alertas), botón terracota "Publicar". Modales:
- **Publicar:** "¿Está seguro de que quiere hacer la publicación de esta noticia?" → Sí (#C43B26) / No (#3A3A3C).
- **Salir:** "¿Está seguro de que quiere cancelar la publicación de esta noticia?" → Sí (#E3361C) / No (#3E9558).

### E. Mapa de Amenazas
Mapa topográfico con pines de colores (rojo, verde, ocre, negro, blanco) y tooltips rojos flotantes al pulsar. Botón flotante de carga rápida.

### F. Mensajería
Bandeja con avatar, nombre, último mensaje, hora, badge rojo de no-leídos. FAB circular rojo con "+". Chat abierto: burbujas gris recibidas / terracota enviadas, campo oscuro redondeado + botón circular blanco con flecha arriba. Sub-pantalla de contactos con directorio y menú de 3 puntos.

### G. Configuración / Perfil
Foto de perfil en aro terracota, bloques anchos terracota con "Nombre" y "Tribu", icono de lápiz blanco para editar, modal "Guardar cambios": "¿Está seguro de que quiere guardar los cambios hechos?".

---

## 5. Configuración técnica obligatoria

### Dependencias que deben estar instaladas
- `react-native-svg` (~15.x compat SDK 54) → renderizar SVGs como componentes nativos.
- `react-native-svg-transformer` (dev) → importar SVGs como `import Foo from '@/assets/svg/foo.svg'`.
- `expo-blur` (~14.x) → efecto blur en el overlay de los modales.

### `metro.config.js` (en raíz del proyecto)
Debe configurar el transformer de SVG para archivos `.svg`. Estructura estándar basada en [`react-native-svg-transformer`](https://github.com/react-native-community/react-native-svg-transformer). El agente implementador debe crear este archivo si no existe.

### Tema
- **SIEMPRE tema claro hueso.** No implementar dark mode.
- En `app/_layout.tsx` definir un tema custom derivado de `DefaultTheme` con `colors.background = '#F2ECE0'` y pasarlo al `ThemeProvider`.
- No depender de `useColorScheme()` para variar estilos.

### Assets SVG
Ubicación: `upatanet/assets/img/` (referencia visual, no se bundlean como pantallas estáticas)
- `publicacion-de-noticia.svg`
- `modal-publicar.svg`
- `modal-salir.svg`

> **IMPORTANTE:** Los SVGs que representan pantallas completas son **referencia visual para extraer medidas, colores y textos literales**. NO se importan como componentes ni se renderizan como imagen estática. La UI se construye con `View`, `TextInput`, `Pressable`, `Text`, `ScrollView`, `KeyboardAvoidingView`, etc.

Los SVGs que sí pueden bundlearnse como componentes son íconos aislados (logo, chips, botones). Si se hace, renombrar a kebab-case y colocarlos en `upatanet/assets/svg/`.

---

## 6. Buenas prácticas obligatorias de React y React Native

> **Cualquier código que viole estos puntos debe ser rechazado en code review.**

### 6.1 Componentes y arquitectura

1. **Un componente por archivo** cuando sea el default export. Componentes auxiliares pequeños pueden coexistir en el mismo archivo si son privados.
2. **Componentes funcionales exclusivamente.** Nada de class components.
3. **Tipado estricto con TypeScript.** Todo componente recibe props tipadas vía `interface` o `type`. Ejemplo:
   ```tsx
   interface CategoryChipProps {
     category: Category;
     selected: boolean;
     onPress: (id: CategoryId) => void;
   }
   export function CategoryChip({ category, selected, onPress }: CategoryChipProps) { ... }
   ```
4. **Nombrado PascalCase** para componentes y archivos `.tsx` de componentes. camelCase para utilidades y hooks.
5. **Cohesión alta, acoplamiento bajo.** Un componente no debe conocer el contexto global; recibe datos por props y emite eventos por callbacks.

### 6.2 Estado

6. **`useState` para estado local simple y moderado.** Para estado compartido entre pantallas, usar Context o una librería externa (Zustand/Jotai) — nunca prop drilling más allá de 2 niveles.
7. **Nunca mutar estado directamente.** Siempre devolver nuevo objeto/array:
   ```ts
   setItems(prev => [...prev, newItem]);     // ok
   items.push(newItem); setItems(items);     // PROHIBIDO
   ```
8. **Inicializar estado con el tipo correcto.** Para arrays/objetos, inicializa con `[]` o `null` con unión explícita (`CategoryId | null`).
9. **`useCallback` para handlers pasados a componentes memorizados.** Úsalo solo si hay memoización real; no envolver todo por defecto.
10. **El estado derivado se calcula, no se guarda.** Si `isValid` depende de `title && body && category`, no lo metas en `useState`; computa en el render.

### 6.3 Efectos

11. **Minimizar `useEffect`.** Si el cálculo puede hacerse en el render o en un handler, no uses effect.
12. **NUNCA omitir el array de dependencias.** Sin array = loop infinito. Array vacío solo para init sin deps.
13. **No usar `useEffect` para transformar props en estado.** Recibe la prop y úsala directamente; si necesitas derivar, computa o usa `useMemo`.
14. **Limpieza obligatoria.** Todo effect que abra un listener, timer o suscripción debe devolver cleanup.

### 6.4 Renderizado y performance

15. **Lista de items → `FlatList`** si son >5 elementos homogéneos. Usar `keyExtractor` y `renderItem` memoizados.
16. **`React.memo` solo cuando hay medición de renders excesivos.** No envolver todo por defecto.
17. **Evitar funciones inline en listas largas.** Extrae handlers con `useCallback` o pasa el id al handler.
18. **`StyleSheet.create` fuera del componente.** Jamás crear estilos inline dentro del render del cuerpo del componente (afecta performance y memoria).
19. **No usar `flex: 1` dentro de `ScrollView` hijos directos.** Usar `contentContainerStyle={{ flexGrow: 1 }}` si necesitas fill.

### 6.5 Estilos

20. **Una sola fuente de verdad para colores:** `constants/upatanet-theme.ts`. **Prohibido hex sueltos en componentes** salvo casos puntuales justificados (sombras, opacidades raras).
21. **Reutilización优先.** Si un estilo se repite ≥3 veces, extraer a un shared StyleSheet.
22. **No usar `display: 'flex'`** (es el default en RN). Sí usar `flexDirection`, `alignItems`, `justifyContent`.
23. **Unidades sin `px`.** En RN los números son density-independent. NO escribir `fontSize: '16px'`.
24. **`textAlign: 'center'`** es preferido sobre `alignSelf` cuando solo se centra texto.

### 6.6 Navegación (expo-router)

25. **Usar `expo-router` hooks y componentes:** `useRouter()`, `Link`, `Stack`, `Tabs`. No usar `useNavigation` de react-navigation directamente salvo caso muy específico.
26. **`router.back()` es preferido a `router.replace('/')`** para cerrar modales (respeta el stack real).
27. **Tipado de rutas:** como `experiments.typedRoutes: true`, solo usar rutas que existan declaradas en `app/`.
28. **`headerShown: false`** en pantallas que controlan su propio header custom (todas las pantallas Upatanet).

### 6.7 Formularios e inputs

29. **`KeyboardAvoidingView` obligatorio** en toda pantalla con inputs. `behavior: Platform.OS === 'ios' ? 'padding' : undefined`.
30. **`Keyboard.dismiss()` al submit** para cerrar teclado antes de navegación o modales.
31. **`blurOnSubmit: false` + `returnKeyType: 'next'`** en formularios multi-campo (mejor UX).
32. **Validación perezosa:** solo tras intento de submit. No marcar errores mientras el usuario teclea.
33. **Texto literal del placeholder EXACTO al diseño.** Ejemplos obligatorios: `"Escriba el título..."`, `"Escriba el cuerpo del reporte..."`, `"Escriba un mensaje aquí"`.

### 6.8 Accesibilidad (mínimo)

34. **`accessibilityLabel`** en todo `Pressable`/`TouchableOpacity` icono-only. Ej: `accessibilityLabel="Cerrar"`.
35. **`accessibilityRole="button"`** en elementos presionables que no son `<Button>`.
36. **Contraste mínimo 4.5:1** en texto sobre fondos (usar `textInverse` sobre `modalBg`).
37. **`hitSlop` ≥ { top: 8, right: 8, bottom: 8, left: 8 }** en botones pequeños (<44pt visuales).

### 6.9 Tipos y TypeScript

38. **`strict: true` ya activo** en `tsconfig.json`. Respetar: no `any` sin justificación, no `@ts-ignore` sin comentario de causa.
39. **Tipos exportados** para cualquier prop que cruce archivos. `export interface CategoryProps { ... }`.
40. **Discriminated unions** para variantes. Ej: `type ModalKind = 'publicar' | 'salir'`.
41. **`as const`** para objetos de configuración constantes (`CATEGORIES`, `paleta`).

### 6.10 Side-effects y mutación

42. **Prohibido `any` cast para evitar errores de tipos.** Si TS chilla, arregla el tipo o usa guards.
43. **Prohibido almacenar funciones en estado.** Si necesitas pasar handlers, usa callbacks o refs.
44. **Prohibido importar side-effects desde dentro de `useEffect` profundo.** Imports siempre top-level.

### 6.11 Commits, git y seguridad

45. **No commitear secretos.** Si encuentras un token en código, extráelo a `.env` y añádelo a `.gitignore`.
46. **No `console.log` en código final** salvo debug justificado; preferir `__DEV__ && console.debug` si debe quedar.
47. **Mensajes de commit en español o inglés consistentes** con el historial del repo (revisar `git log --oneline -10` antes del primer commit).
48. **No commitear a menos que el usuario lo pida explícitamente.**
49. **No hacer `git push --force` ni rebase de branches compartidas.**
50. **No desactivar hooks de git, eslint o typescript** para hacer pasar código.

---

## 7. Flujo de trabajo recomendado para agentes

Antes de escribir código, un agente debe:

1. **Leer este `AGENTS.md` completo.**
2. **Consultar https://docs.expo.dev/versions/v54.0.0/** si usa APIs de Expo dudosas.
3. **Explorar la estructura** con `Glob`/`Read` antes de crear archivos nuevos (evitar duplicados).
4. **Revisar `package.json`** para confirmar que una dependencia ya existe antes de importarla.
5. **Verificar el lint:** tras cambios, correr `npm run lint` y `npx tsc --noEmit`.
6. **NO commitear** salvo pedido explícito del usuario.
7. **Si surge una decisión no contemplada aquí,** preguntar al usuario antes de asumirla.

---

## 8. Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Pantallas | `kebab-case.tsx` en `app/` | `app/publicar.tsx` |
| Componentes | `PascalCase.tsx` en `components/` | `components/CategoryChip.tsx` |
| Hooks | `use-kebab-case.ts` en `hooks/` | `hooks/use-color-scheme.ts` |
| Constantes | `kebab-case.ts` en `constants/` | `constants/upatanet-theme.ts` |
| Mocks data | `kebab-case.ts` en `data/` | `data/categories.ts` |
| Assets SVG | `kebab-case.svg` en `assets/svg/` | `assets/svg/icon-salud.svg` |
| Tipos exportados | `PascalCase` | `type Category = { ... }` |
| Enums/unions | `PascalCase` con valores string | `type ModalKind = 'publicar' \| 'salir'` |

---

## 9. Textos literales obligatorios (extracto Figma)

Estos textos deben aparecer EXACTAMENTE (no parafrasear):

- Placeholder título: `Escriba el título...`
- Placeholder cuerpo: `Escriba el cuerpo del reporte...`
- Botón submit: `Publicar`
- Header: `Nueva publicación` (o `Publicar noticia` según variante)
- Modal Publicar mensaje: `¿Está seguro de que quiere hacer la publicación de esta noticia?`
- Modal Publicar botones: `Sí` / `No`
- Modal Salir mensaje: `¿Está seguro de que quiere cancelar la publicación de esta noticia?`
- Categorías: `Salud`, `Insumos`, `Naturaleza`, `Alertas`
- Botón modal guardar cambios (perfil, futuro): `¿Está seguro de que quiere guardar los cambios hechos?`

---

## 10. Recordatorios finales

- **El proyecto está en Plan mode cuando se diseña.** Si el usuario solicita implementación, se sale de Plan mode y se ejecuta.
- **No inventar URLs ni endpoints.** Mientras no haya backend, todo es mock local en `data/`.
- **El usuario decide el alcance por fase.** Si pide solo X, no implementar Y "de paso".
- **Cualquier ambigüedad se resuelve con `question` tool, no asumiendo.**
- **Después de completar una tarea:** correr `npm run lint` y `npx tsc --noEmit` y reportar resultado al usuario.
