/* ============================================================
   Ejercicio Práctico · Normalización de Bases de Datos
   Caso de estudio resuelto paso a paso: cada forma normal se
   aplica sobre el mismo modelo y se evidencia con MER, tablas
   de datos, retos y un examen final.
   ============================================================ */

const PHASES = {
  inicio: { label: 'Inicio',  color: '#94a3b8', icon: '🚀' },
  unf:    { label: '1NF',     color: '#22d3ee', icon: '🥇' },
  sfn:    { label: '2NF',     color: '#a78bfa', icon: '🥈' },
  tfn:    { label: '3NF',     color: '#34d399', icon: '🥉' },
  navz:   { label: 'Superiores', color: '#fb7185', icon: '🚀' },
};

const CONCEPTS = {
  atomicidad:     { ic:'⚛️', label:'Atomicidad',       color:'#22d3ee', desc:'Cada celda guarda un único valor indivisible. Se acabaron las listas o arreglos dentro de un campo.' },
  clave_primaria: { ic:'🔑', label:'Clave primaria',   color:'#fbbf24', desc:'Columna(s) que identifican de forma única cada fila. Nunca se repite, nunca es nula.' },
  sin_grupos:     { ic:'🚫', label:'Sin grupos repetidos', color:'#22d3ee', desc:'Nada de columnas del mismo tipo: Tel1, Tel2, Tel3… Cada dato tiene su propio lugar.' },
  clave_compuesta:{ ic:'🔐', label:'Clave compuesta',  color:'#fbbf24', desc:'Clave primaria formada por dos o más columnas. Su combinación es la que garantiza la unicidad.' },
  clave_foranea:  { ic:'🔗', label:'Clave foránea (FK)', color:'#22d3ee', desc:'Columna que apunta a la clave primaria de otra tabla. Así se conectan las entidades.' },
  dep_funcional:  { ic:'🧩', label:'Dependencia funcional', color:'#a78bfa', desc:'Regla de oro: todo atributo no clave depende de toda la clave primaria, y solo de ella.' },
  dep_parcial:    { ic:'✂️', label:'Dependencia parcial', color:'#fb7185', desc:'Viola la 2NF: un atributo depende solo de una parte de una clave compuesta.' },
  dep_transitiva: { ic:'🔗', label:'Dependencia transitiva', color:'#fb7185', desc:'Viola la 3NF: un atributo depende de otra columna no clave (ID → X → Y). Cadena innecesaria.' },
  dep_multivaluada:{ ic:'🔀', label:'Dependencia multivaluada', color:'#fb7185', desc:'Viola la 4NF: dos listas de 1:N independientes conviven en la misma tabla (A ↠ B).' },
  dep_union:      { ic:'🧩', label:'Dependencia de unión', color:'#fb7185', desc:'Viola la 5NF: la tabla original solo se reconstruye uniendo 3 o más piezas a la vez.' },
  producto_cartesiano:{ ic:'✖️', label:'Producto cartesiano', color:'#fbbf24', desc:'Combinar cada valor de una lista con cada valor de otra. Multiplica filas: 2×2 = 4, 4×4 = 16.' },
  anomalia_actualizacion:{ ic:'🐛', label:'Anomalía de actualización', color:'#fb7185', desc:'Cambiar un dato repetido en muchas filas… y que una se quede con el valor viejo. Inconsistencia.' },
  filas_fantasma: { ic:'👻', label:'Filas fantasma',  color:'#fb7185', desc:'Datos falsos que "aparecen" al reconstruir una tabla mal descompuesta (producto cartesiano de piezas).' },
  bcnf:           { ic:'🛡️', label:'BCNF',            color:'#34d399', desc:'Forma Normal de Boyce-Codd: versión más estricta de la 3NF para claves candidatas que se solapan.' },
  descomposicion: { ic:'🏗️', label:'Descomposición',   color:'#34d399', desc:'El alma de la normalización: dividir tablas grandes en pequeñas sin perder información (join lossless).' },
  indexar:        { ic:'🧭', label:'Pérdida de indexación', color:'#fbbf24', desc:'Buscar dentro de una lista obliga a LIKE "%texto%" o a manipular cadenas: caro y frágil.' },
  temporal:       { ic:'⏳', label:'Datos temporales',  color:'#34d399', desc:'Bases de datos que rastrean el historial y los cambios de cada dato a lo largo del tiempo.' },
};

const CHEAT = [
  { fn:'Contenido sin normalizar', reqs:'Listas en celdas · sin clave · grupos repetidos', ano:'Búsquedas con LIKE %% y manipulación frágil de cadenas', ex:'"Matemáticas, Física" dentro de una celda' },
  { fn:'1NF 🥇', reqs:'Celdas atómicas · clave primaria · sin grupos repetidos', ano:'Pérdida de indexación', ex:'Una fila por curso; el teléfono en su propia tabla' },
  { fn:'2NF 🥈', reqs:'1NF + todo atributo depende de TODA la clave compuesta', ano:'Dependencias parciales', ex:'Nombre sale de Inscripciones; Curso → Profesor' },
  { fn:'3NF 🥉', reqs:'2NF + sin dependencias transitivas', ano:'Anomalías de actualización e inconsistencia', ex:'Departamentos en su propia tabla' },
  { fn:'BCNF 🛡️', reqs:'3NF + toda clave candidata es superclave', ano:'Redundancia con claves candidatas solapadas', ex:'(Compañía, Proyecto, Empleado)' },
  { fn:'4NF 🔀', reqs:'3NF/BCNF + sin dependencias multivaluadas', ano:'Productos cartesianos', ex:'Idiomas y deportes en tablas independientes' },
  { fn:'5NF 🧩', reqs:'4NF + sin dependencias de unión (join)', ano:'Filas fantasma 👻', ex:'Vendedor / Producto / Cliente en 3 tablas' },
  { fn:'6NF ⏳', reqs:'5NF + clave y un único atributo por tabla', ano:'Extremo (casi siempre innecesario)', ex:'Una tabla por atributo para historiales' }
];

const GROWTH = [
  { label:'Caos', n:0, c:'#fb7185' },
  { label:'1NF', n:3, c:'#22d3ee' },
  { label:'2NF', n:5, c:'#a78bfa' },
  { label:'3NF', n:6, c:'#34d399' }
];

const MODELO_3NF = {
  type:'schema',
  tables:[
    { name:'Estudiantes', icon:'👤', columns:[ {k:'PK',n:'ID_Estudiante'}, {k:null,n:'Nombre'} ] },
    { name:'Telefonos', icon:'📞', columns:[ {k:'PK',n:'ID_Telefono'}, {k:null,n:'Numero'}, {k:'FK',n:'ID_Estudiante'} ] },
    { name:'Departamentos', icon:'🏢', columns:[ {k:'PK',n:'ID_Departamento'}, {k:null,n:'Nombre_Departamento'} ] },
    { name:'Profesores', icon:'👨‍🏫', columns:[ {k:'PK',n:'ID_Profesor'}, {k:null,n:'Nombre_Profesor'}, {k:'FK',n:'ID_Departamento'} ] },
    { name:'Cursos', icon:'📚', columns:[ {k:'PK',n:'ID_Curso'}, {k:null,n:'Nombre_Curso'}, {k:'FK',n:'ID_Profesor'} ] },
    { name:'Inscripciones', icon:'📝', columns:[ {k:'PK',n:'ID_Estudiante'}, {k:'PK',n:'ID_Curso'}, {k:null,n:'Nota_Final'} ] }
  ],
  relations:[
    {from:'Telefonos', to:'Estudiantes', label:'N : 1'},
    {from:'Profesores', to:'Departamentos', label:'N : 1'},
    {from:'Cursos', to:'Profesores', label:'N : 1'},
    {from:'Inscripciones', to:'Estudiantes', label:'N : 1'},
    {from:'Inscripciones', to:'Cursos', label:'N : 1'}
  ]
};

const STEPS = [
/* ---------- INICIO ---------- */
{
  id:'p0', phase:'inicio', emoji:'🌱',
  title:'Enunciado del ejercicio',
  subtitle:'Aplicar un proceso de normalización completo sobre un caso de estudio, evidenciando cada paso con su MER.',
  chat:you('Enunciado: "Implementa un proceso de normalización en una base de datos según las formas normales". Partimos de un registro de inscripciones en bruto y lo llevaremos hasta 3NF y formas superiores, dejando el MER antes y después de cada paso como evidencia.'),
  chatAi:'Normalizar es <strong>organizar los datos</strong> para reducir redundancia y evitar anomalías al insertar, actualizar o eliminar. Como los cimientos de un edificio 🏗️.<br><br>Plan de trabajo del ejercicio: <strong>① plantear el caso en bruto</strong>, ② aplicar 1NF → 2NF → 3NF sobre el mismo modelo, ③ escalar a las formas superiores (BCNF… 6NF) y cerrar con un examen.',
  diagram:{
    note:'La meta: transformar una tabla desordenada en una estructura limpia, forma normal tras forma normal.',
    type:'schema',
    tables:[
      { name:'TODO DESORDENADO', icon:'💥', columns:[
        {k:null,n:'Celdas con listas (1,2,3…)',flag:'bad'},
        {k:null,n:'Filas duplicadas',flag:'bad'},
        {k:null,n:'Sin identificador único',flag:'bad'}
      ], note:'Antes' },
      { name:'MODELO NORMALIZADO', icon:'✨', columns:[
        {k:'PK',n:'Identificador único'},
        {k:null,n:'Celdas atómicas'},
        {k:'FK',n:'Conectado por claves foráneas'}
      ], note:'Después' }
    ],
    relations:[ {from:'TODO DESORDENADO', to:'MODELO NORMALIZADO', label:'normalización', dashed:true} ]
  },
  clouds:['atomicidad','clave_primaria','descomposicion'],
  takeaway:'Normalizar es eliminar redundancia y anomalías. El viaje va de una tabla caótica a un modelo limpio repleto de tablas conectadas por claves.'
},

/* ---------- 1NF ---------- */
{
  id:'p2', phase:'unf', emoji:'🥇',
  title:'Las 3 reglas de la Primera Forma Normal',
  subtitle:'Una tabla está en 1NF cuando respeta tres condiciones fundamentales.',
  reto:{
    q:'Antes de ver las reglas: una celda con "Matemáticas, Física, Química"… ¿qué rompe?',
    opts:['Nada, es válido','La atomicidad ⚛️','Es una dependencia transitiva'], ok:1,
    explain:'¡La atomicidad! Cada celda debe guardar un único valor indivisible. Eso es la base de la 1NF.'
  },
  chatAi:'Para que una tabla cumpla la <strong>1NF</strong> 🥇 debe respetar:<br><br>➊ <strong>Atomicidad</strong> ⚛️ — cada celda guarda un solo valor indivisible.<br>➋ <strong>Clave primaria</strong> 🔑 — cada fila es única e identificable.<br>➌ <strong>Sin grupos repetidos</strong> 🚫 — nada de Telefono1, Telefono2, Telefono3.',
  diagram:{
    note:'El decálogo de la 1NF.',
    type:'schema',
    tables:[ { name:'REGLAS 1NF', icon:'🥇', columns:[
      {k:'⚛️',n:'Celdas atómicas',flag:'good'},
      {k:'🔑',n:'Clave primaria definida',flag:'good'},
      {k:'🚫',n:'Sin grupos repetidos',flag:'good'}
    ]} ]
  },
  clouds:['atomicidad','clave_primaria','sin_grupos'],
  takeaway:'Tres reglas, un objetivo: que cada dato viva en su propio lugar, único y atómico.'
},
{
  id:'p3', phase:'unf', emoji:'📋',
  title:'La tabla sin normalizar',
  subtitle:'Registro de inscripción de estudiantes: fíjate en las columnas en rojo.',
  diagram:{
    note:'Datos de muestra — las celdas en rojo violan la atomicidad.',
    type:'dataset',
    cols:['ID_Estudiante','Nombre','Cursos_Inscritos','Telefono_Contacto'],
    rows:[
      ['101','Ana Gómez','Matemáticas, Física, Química','555-1234, 555-5678'],
      ['102','Carlos Ruíz','Historia','555-9999'],
      ['103','María López','Programación, Base de Datos','555-0000']
    ],
    warn:[2,3],
    pkCol:0,
    caption:'Tabla: InscripciónEstudiantes (antes de aplicar 1NF)'
  },
  chat:you('pues tendríamos que o hacer una consulta muy compleja o gastar muchos recursos accediendo específicamente a la posición del registro… como elegir siempre la opción en el índice 1 del arreglo.'),
  chatAi:'Al guardar <strong>listas dentro de una celda</strong>, la base de datos pierde su capacidad de indexar. Para buscar "Física" tendrían que usarse búsquedas de texto como <code>LIKE \'%Física%\'</code> o manipular cadenas: muchísimos recursos y lógica relacional rota.',
  clouds:['atomicidad','indexar'],
  takeaway:'Ana Gómez viola la atomicidad en dos columnas. Cada celda debe contener un único valor.'
},
{
  id:'p4', phase:'unf', emoji:'✂️',
  title:'Aplicando atomicidad a los cursos',
  subtitle:'Una fila por cada curso: Ana Gómez ahora ocupa 3 filas.',
  diagram:{
    note:'La solución: separar Cursos_Inscritos en filas individuales.',
    type:'dataset',
    cols:['ID_Estudiante','Nombre','Curso','Telefono_Contacto'],
    rows:[
      ['101','Ana Gómez','Matemáticas','555-1234'],
      ['101','Ana Gómez','Física','555-1234'],
      ['101','Ana Gómez','Química','555-1234'],
      ['102','Carlos Ruíz','Historia','555-9999'],
      ['103','María López','Programación','555-0000'],
      ['103','María López','Base de Datos','555-0000']
    ],
    pkCol:0,
    highlightDup:true,
    caption:'Tabla: Inscripciones  —  Curso ahora es atómico'
  },
  chatAi:'Para cumplir la <strong>atomicidad</strong> ⚛️ separamos esos datos para que cada celda tenga un único valor. Ana pasa a tener una fila por curso.<br><br>Pero ahora <code>ID_Estudiante = 101</code> se repite… <br>➡️ ¿Puede seguir siendo clave primaria por sí solo, o necesitamos una <strong>clave compuesta</strong>?',
  chat:you('ID_estudiante y curso deberían ser la llave compuesta: ID estudiante es el mismo, y nombre tampoco nos sirve… necesitamos un valor que desempate, y por peso y contexto la ideal sería curso.'),
  clouds:['atomicidad','clave_compuesta'],
  takeaway:'La dupla (ID_Estudiante, Curso) ya no se repite: es una clave primaria compuesta válida.'
},
{
  id:'p5', phase:'unf', emoji:'🔐',
  title:'Clave primaria compuesta',
  subtitle:'La combinación de dos columnas garantiza que cada fila sea única.',
  diagram:{
    note:'La clave compuesta: la dupla (ID_Estudiante, Curso) nunca se repite.',
    type:'schema',
    tables:[ { name:'Inscripciones', icon:'📝', columns:[
      {k:'PK',n:'ID_Estudiante'},
      {k:'PK',n:'Curso'},
      {k:null,n:'Nombre'},
      {k:null,n:'Telefono_Contacto',flag:'bad'}
    ], note:'La parte rosada aún rompe la 1NF' } ]
  },
  chatAi:'La combinación <strong>(ID_Estudiante, Curso)</strong> funciona como <strong>clave primaria compuesta</strong> 🔑.<br><br>Pero para cerrar la 1NF falta una columna que <em>aún</em> conserva una lista: <strong>Telefono_Contacto</strong> (Ana tiene <code>555-1234, 555-5678</code>).',
  clouds:['clave_compuesta','atomicidad'],
  takeaway:'Clave compuesta identificada. Ahora toca resolver el teléfono de Ana sin volver a romper la atomicidad.'
},
{
  id:'p6', phase:'unf', emoji:'🌀',
  title:'El dilema de los teléfonos',
  subtitle:'Separar teléfonos multiplica las filas: el producto cartesiano entra en acción.',
  diagram:{
    note:'Al separar también los teléfonos, cada curso se cruza con cada teléfono.',
    type:'dataset',
    cols:['ID_Estudiante','Nombre','Curso','Telefono_Contacto'],
    rows:[
      ['101','Ana Gómez','Matemáticas','555-1234'],
      ['101','Ana Gómez','Matemáticas','555-5678'],
      ['101','Ana Gómez','Física','555-1234'],
      ['101','Ana Gómez','Física','555-5678'],
      ['102','Carlos Ruíz','Historia','555-9999']
    ],
    warn:[1,2,3],
    pkCol:0,
    highlightDup:true,
    caption:'2 cursos × 2 teléfonos = 4 combinaciones… solo para Ana'
  },
  chatAi:'Al separar los teléfonos con la misma idea de atomicidad, el nombre y el curso se repiten para cada teléfono. Aparece muchísima <strong>redundancia</strong>.<br><br>La clave <code>(ID_Estudiante, Curso)</code> ya no identifica filas únicas… ¿qué columna debe sumarse a la clave?',
  chat:you('telefono_contacto no?'),
  chatAi2:'La clave pasaría a <strong>(ID_Estudiante, Curso, Telefono_Contacto)</strong>.<br><br>Pero al resolver la atomicidad así, multiplicamos filas (producto cartesiano) y generamos redundancia innecesaria. La solución de raíz: <strong>separar las entidades en tablas distintas vinculadas por claves foráneas (FK)</strong> 🔗.',
  clouds:['producto_cartesiano','clave_compuesta','clave_foranea'],
  takeaway:'Resolver a punta de más claves empeora: genera productos cartesianos. La salida real es separar en tablas.'
},
{
  id:'p7', phase:'unf', emoji:'✅',
  title:'Cierre de la 1NF: separar entidades',
  subtitle:'Tres tablas y una clave foránea: la atomicidad se respeta sin redundancia.',
  diagram:{
    note:'La FK ID_Estudiante va en Telefonos (lado "muchos"). Inscripciones aún arrastra datos de otros.',
    type:'schema',
    tables:[
      { name:'Estudiantes', icon:'👤', columns:[
        {k:'PK',n:'ID_Estudiante'},
        {k:null,n:'Nombre'}
      ], note:'Un estudiante, un solo registro' },
      { name:'Telefonos', icon:'📞', columns:[
        {k:'PK',n:'ID_Telefono'},
        {k:null,n:'Numero'},
        {k:'FK',n:'ID_Estudiante'}
      ], note:'Muchos teléfonos por estudiante' },
      { name:'Inscripciones', icon:'📝', columns:[
        {k:'PK',n:'ID_Estudiante'},
        {k:'PK',n:'ID_Curso'},
        {k:null,n:'Nombre'},
        {k:null,n:'Nombre_Curso'},
        {k:null,n:'Nombre_Profesor'},
        {k:null,n:'Nota_Final'}
      ], note:'Clave compuesta: aún con datos repetidos' }
    ],
    relations:[
      {from:'Telefonos', to:'Estudiantes', label:'N : 1'},
      {from:'Inscripciones', to:'Estudiantes', label:'N : 1'}
    ]
  },
  chat:you('literal pondría un id y luego el campo teléfono o número, y asociaría ese id de teléfono en la tabla estudiante.'),
  chatAi:'Detalle a corregir: si metemos <code>ID_Telefono</code> en <strong>Estudiantes</strong>, Ana tendría que guardar sus dos IDs en la misma celda (<code>1, 2</code>)… eso rompe la atomicidad otra vez.<br><br>👉 La FK se pone <em>al revés</em>: <strong>ID_Estudiante dentro de Telefonos</strong>. Cada número apunta a un único alumno.',
  chatAi2:'Cerramos la <strong>1NF</strong> 🥇:<br>✅ Celdas atómicas · ✅ Clave primaria definida · ✅ Sin grupos repetidos.<br><br>El registro de inscripciones queda como tabla propia con clave compuesta <code>(ID_Estudiante, ID_Curso)</code>: el curso ya se identifica por su ID y su nombre pasa a ser un dato más.<br><br>⚠️ Ojo con Inscripciones: <strong>Nombre</strong>, <strong>Nombre_Curso</strong> y <strong>Nombre_Profesor</strong> se siguen repitiendo fila tras fila. La atomicidad está ✅, pero esa redundancia es exactamente lo que atacará la <strong>2NF</strong> 🥈.',
  clouds:['clave_foranea','clave_compuesta','atomicidad'],
  takeaway:'1NF ✅. Cada dato en su celda, cada fila única y las FK del lado de los "muchos". Inscripciones aún guarda datos de otros: ahí entra la 2NF.'
},
{
  id:'q1nf', phase:'unf', emoji:'🥇',
  title:'Mini-control: 1NF',
  subtitle:'Tres preguntas para fijar la Primera Forma Normal.',
  quiz:[
    { q:'¿Qué viola una celda con "555-1234, 555-5678"?',
      opts:['Atomicidad ⚛️','Grupos repetidos','Dependencia parcial'], ok:0,
      feed:'Es atomicidad: dos valores en una misma celda. Grupos repetidos serían columnas Tel1/Tel2/Tel3.' },
    { q:'Tras separar los cursos, ¿cuál es la clave primaria correcta?',
      opts:['Solo ID_Estudiante','(ID_Estudiante, Curso)','ID + Teléfono'], ok:1,
      feed:'La compuesta (ID_Estudiante, Curso) garantiza filas únicas sin inventar más clave.' },
    { q:'En la relación 1:N estudiante → teléfonos, la FK se coloca…',
      opts:['En el lado del "uno"','En el lado del "muchos"','En ambas tablas'], ok:1,
      feed:'En Telefonos: cada número apunta a su estudiante, sin romper la atomicidad.' }
  ],
  clouds:[],
  takeaway:'1NF = atómico + clave + sin grupos repetidos. Y la FK siempre va del lado del "muchos".'
},

/* ---------- 2NF ---------- */
{
  id:'p8', phase:'sfn', emoji:'🥈',
  title:'Segunda Forma Normal: dependencia funcional total',
  subtitle:'En 2NF todo atributo no clave debe depender de TODA la clave primaria compuesta.',
  reto:{
    q:'La clave es (ID_Estudiante, ID_Curso): ¿de qué depende realmente el atributo Nombre?',
    opts:['De la clave completa','Solo de ID_Estudiante ✂️','Del curso'], ok:1,
    explain:'Nombre depende únicamente de ID_Estudiante: es una dependencia parcial, justo lo que la 2NF elimina.'
  },
  chatAi:'La tabla debe estar en <strong>1NF</strong> <em>y además</em>:<br><br>➊ <strong>Dependencia funcional total</strong> 🧩 — todo atributo que no forma parte de la clave debe depender de <em>toda</em> la clave, no de una sola parte.<br><br>Partimos de lo que dejó la 1NF: <strong>Estudiantes</strong> y <strong>Telefonos</strong> ya están separadas… el problema vive en <strong>Inscripciones</strong>. Si la clave es <code>(ID_Estudiante, ID_Curso)</code>: ¿el atributo <strong>Nombre</strong> depende de la combinación completa, o solo de una parte?',
  diagram:{
    note:'El problema que ataca la 2NF: dependencias parciales.',
    type:'schema',
    tables:[ { name:'Inscripciones (en 1NF)', icon:'📝', columns:[
      {k:'PK',n:'ID_Estudiante'},
      {k:'PK',n:'ID_Curso'},
      {k:null,n:'Nombre',flag:'bad'},
      {k:null,n:'Nombre_Curso',flag:'bad'},
      {k:null,n:'Nombre_Profesor',flag:'bad'},
      {k:null,n:'Nota_Final',flag:'good'}
    ], note:'Rojo = depende de solo una parte de la clave' } ]
  },
  chat:you('creo que solo de id estudiante no? entonces un mejor enfoque sería sacar la tabla estudiantes, cursos y teléfonos?'),
  chatAi:'El <strong>Nombre</strong> depende únicamente del <code>ID_Estudiante</code>, sin importar cuál curso tome: eso es una <strong>dependencia parcial</strong>, justo lo que la <strong>2NF</strong> elimina: la solución es separar en tablas.<br><br>Matiz a tu lista: <strong>Estudiantes</strong> y <strong>Telefonos</strong> ya nacieron al cerrar la 1NF — no hay que crearlas otra vez. La que falta es <strong>Cursos</strong>. Y ojo: <code>Nombre_Curso</code> y <code>Nombre_Profesor</code> también dependen solo de <code>ID_Curso</code>. Vayamos una por una.',
  clouds:['dep_funcional','dep_parcial','clave_compuesta'],
  takeaway:'Tres parciales en la misma tabla: Nombre solo de ID_Estudiante; Nombre_Curso y Nombre_Profesor solo de ID_Curso. Ninguna depende de la clave completa.'
},
{
  id:'p9', phase:'sfn', emoji:'🧹',
  title:'Fuera Nombre y Nombre_Curso',
  subtitle:'Cada columna vuelve a su dueño: Estudiantes ya existía; Cursos se crea ahora.',
  diagram:{
    note:'Las dos parciales se mudan: el Nombre ya tenía hogar y el Nombre_Curso funda la tabla Cursos.',
    newTables:['Cursos'],
    type:'schema',
    tables:[
      { name:'Estudiantes', icon:'👤', columns:[
        {k:'PK',n:'ID_Estudiante'},
        {k:null,n:'Nombre',flag:'good'}
      ], note:'El hogar del Nombre ya existía desde la 1NF' },
      { name:'Cursos', icon:'📚', columns:[
        {k:'PK',n:'ID_Curso'},
        {k:null,n:'Nombre_Curso',flag:'good'}
      ], note:'Nueva: aquí vive el Nombre_Curso' },
      { name:'Inscripciones', icon:'📝', columns:[
        {k:'PK',n:'ID_Estudiante'},
        {k:'PK',n:'ID_Curso'},
        {k:null,n:'Nota_Final',flag:'good'},
        {k:null,n:'Nombre_Profesor',flag:'bad'}
      ], note:'Una parcial sigue en pie: Nombre_Profesor' }
    ],
    relations:[
      {from:'Inscripciones', to:'Estudiantes', label:'N : 1'},
      {from:'Inscripciones', to:'Cursos', label:'N : 1'}
    ]
  },
  chatAi:'Dos columnas, dos mudanzas:<br><br>➊ <strong>Nombre</strong> 👤 — depende solo de <code>ID_Estudiante</code>. No hay que crear nada: <strong>Estudiantes</strong> ya vive desde la 1NF. Se elimina la <em>columna</em> de Inscripciones (no los datos) y <code>ID_Estudiante</code> queda como parte de la clave y como puente hacia su tabla.<br>➋ <strong>Nombre_Curso</strong> 📚 — depende solo de <code>ID_Curso</code>: nace la tabla <strong>Cursos</strong>, cuya PK es justo ese <code>ID_Curso</code> que Inscripciones ya traía.<br><br>En Inscripciones solo quedan <strong>Nota_Final</strong> (depende de la pareja completa ✔️) y <code>Nombre_Profesor</code>, que aún arrastramos en rojo…',
  clouds:['dep_parcial','clave_foranea','descomposicion'],
  takeaway:'Las parciales no se borran: se mudan. El Nombre ya estaba en Estudiantes y el Nombre_Curso fundó Cursos. Falta Nombre_Profesor.'
},
{
  id:'p10', phase:'sfn', emoji:'🧠',
  title:'Nota_Final vs Nombre_Profesor',
  subtitle:'Solo una de estas columnas rompe la 2NF. ¿Cuál?',
  diagram:{
    note:'Dos columnas candidatas en la tabla intermedia.',
    type:'schema',
    tables:[ { name:'Inscripciones', icon:'📝', columns:[
      {k:'PK',n:'ID_Estudiante'},
      {k:'PK',n:'ID_Curso'},
      {k:null,n:'Nota_Final',flag:'good'},
      {k:null,n:'Nombre_Profesor',flag:'bad'}
    ], note:'Verde = depende de toda la clave · Rojo = dependencia parcial' } ]
  },
  chat:you('si claro el nombre de profesor y nota final… ¿ambos o solo uno de esos?'),
  chatAi:'Solo <strong>uno</strong> rompe la regla:<br><br>➊ <strong>Nota_Final</strong> 📝 depende de <em>ambos</em>: necesitas saber <em>quién</em> la obtuvo y <em>en cuál</em> curso. 😌 Cumple la 2NF.<br>➋ <strong>Nombre_Profesor</strong> 👨‍🏫 depende <em>únicamente del ID_Curso</em>: el profesor imparte la materia sin importar qué alumno esté inscrito. → Dependencia parcial.<br><br>Es la última que queda en rojo: en el paso siguiente le damos hogar. 🏠',
  clouds:['dep_funcional','dep_parcial'],
  takeaway:'Nota_Final depende de la pareja completa; Nombre_Profesor depende solo de ID_Curso. Este último debe salir de la tabla.'
},
{
  id:'p11', phase:'sfn', emoji:'🏠',
  title:'¿A dónde va Nombre_Profesor?',
  subtitle:'El profesor pertenece al curso… y la FK del profesor también va en Cursos.',
  diagram:{
    note:'Nombre_Profesor sale de Inscripciones: se muda a Profesores y Cursos solo guarda la FK ID_Profesor.',
    newTables:['Profesores'],
    type:'schema',
    tables:[
      { name:'Profesores', icon:'👨‍🏫', columns:[ {k:'PK',n:'ID_Profesor'}, {k:null,n:'Nombre_Profesor'} ], note:'Nueva tabla: hogar de la última parcial' },
      { name:'Cursos', icon:'📚', columns:[ {k:'PK',n:'ID_Curso'}, {k:null,n:'Nombre_Curso'}, {k:'FK',n:'ID_Profesor'} ], note:'Ya existía; ahora gana la FK del profesor' },
      { name:'Inscripciones', icon:'📝', columns:[ {k:'PK',n:'ID_Estudiante'}, {k:'PK',n:'ID_Curso'}, {k:null,n:'Nota_Final',flag:'good'} ], note:'¡Limpia: cero columnas ajenas!' }
    ],
    relations:[
      {from:'Cursos', to:'Profesores', label:'N : 1'},
      {from:'Inscripciones', to:'Cursos', label:'N : 1'}
    ]
  },
  chat:you('en una tabla de profesores, pero teniendo en cuenta que en la tabla curso debe ir referenciado el id del profesor que imparte el curso.'),
  chatAi:'Crear la tabla <strong>Profesores</strong> 👨‍🏫 y colocar <code>ID_Profesor</code> como <strong>FK</strong> en <strong>Cursos</strong> resuelve la última dependencia parcial: con esto, la estructura queda oficialmente en <strong>2NF</strong>.',
  clouds:['clave_foranea','dep_parcial'],
  takeaway:'Ya no queda ninguna columna ajena en Inscripciones: Nombre en Estudiantes, Nombre_Curso en Cursos y Nombre_Profesor en Profesores.'
},
{
  id:'p12', phase:'sfn', emoji:'🗂️',
  title:'Estructura final en 2NF',
  subtitle:'Cinco tablas limpias conectadas por claves foráneas. Cuéntalas.',
  diagram:{
    note:'El MER completo al cerrar la 2NF: las 🆕 son las tablas que creó la 2NF.',
    newTables:['Cursos','Profesores'],
    type:'schema',
    tables:[
      { name:'Estudiantes', icon:'👤', columns:[ {k:'PK',n:'ID_Estudiante'}, {k:null,n:'Nombre'} ] },
      { name:'Telefonos', icon:'📞', columns:[ {k:'PK',n:'ID_Telefono'}, {k:null,n:'Numero'}, {k:'FK',n:'ID_Estudiante'} ] },
      { name:'Profesores', icon:'👨‍🏫', columns:[ {k:'PK',n:'ID_Profesor'}, {k:null,n:'Nombre_Profesor'} ] },
      { name:'Cursos', icon:'📚', columns:[ {k:'PK',n:'ID_Curso'}, {k:null,n:'Nombre_Curso'}, {k:'FK',n:'ID_Profesor'} ] },
      { name:'Inscripciones', icon:'📝', columns:[ {k:'PK',n:'ID_Estudiante'}, {k:'PK',n:'ID_Curso'}, {k:null,n:'Nota_Final'} ] }
    ],
    relations:[
      {from:'Telefonos', to:'Estudiantes', label:'N : 1'},
      {from:'Cursos', to:'Profesores', label:'N : 1'},
      {from:'Inscripciones', to:'Estudiantes', label:'N : 1'},
      {from:'Inscripciones', to:'Cursos', label:'N : 1'}
    ]
  },
  chatAi:'Estructura de la 2NF:<br><br>• <strong>Estudiantes</strong> 👤 — ID_Estudiante (PK), Nombre<br>• <strong>Telefonos</strong> 📞 — ID_Telefono (PK), Numero, ID_Estudiante (FK)<br>• <strong>Profesores</strong> 👨‍🏫 — ID_Profesor (PK), Nombre_Profesor<br>• <strong>Cursos</strong> 📚 — ID_Curso (PK), Nombre_Curso, ID_Profesor (FK)<br>• <strong>Inscripciones</strong> 📝 — (ID_Estudiante, ID_Curso) PK, Nota_Final<br><br>Así quedaron las tres parciales: <strong>Nombre</strong> → Estudiantes · <strong>Nombre_Curso</strong> → Cursos · <strong>Nombre_Profesor</strong> → Profesores. Y <strong>Nota_Final</strong> se quedó en Inscripciones, porque depende de la pareja completa. Cero dependencias parciales.',
  clouds:['clave_compuesta','clave_foranea','dep_funcional'],
  takeaway:'2NF ✅. Cinco tablas, cero dependencias parciales: todo atributo depende de toda la clave.'
},
{
  id:'q2nf', phase:'sfn', emoji:'🥈',
  title:'Mini-control: 2NF',
  subtitle:'Dependencias parciales en clave compuesta.',
  quiz:[
    { q:'Un atributo que depende de solo la mitad de una clave compuesta…',
      opts:['Cumple 2NF','Es una dependencia parcial ✂️','Es una dependencia de unión'], ok:1,
      feed:'Dependencia parcial: la 2NF exige depender de TODA la clave primaria.' },
    { q:'Nota_Final en Inscripciones (ID_Estudiante, ID_Curso)…',
      opts:['Depende de toda la clave ✅','Depende solo de ID_Estudiante','Es multivaluada'], ok:0,
      feed:'Necesitas saber quién la sacó y en qué curso: depende de la pareja completa.' },
    { q:'¿Dónde vive ID_Profesor?',
      opts:['En Inscripciones','En Cursos (FK) 💼','En Departamentos'], ok:1,
      feed:'El profesor pertenece al curso: ID_Profesor es FK en Cursos.' },
    { q:'Tras aplicar la 2NF, Nombre_Curso vive…',
      opts:['En Inscripciones (sin cambio)','En Cursos, su propia tabla 📚','En Profesores'], ok:1,
      feed:'Nombre_Curso dependía solo de ID_Curso: por eso nació la tabla Cursos y Inscripciones dejó de arrastrarlo.' }
  ],
  clouds:[],
  takeaway:'2NF = elimina dependencias parciales: todo atributo depende de TODA la clave compuesta.'
},

/* ---------- 3NF ---------- */
{
  id:'p13', phase:'tfn', emoji:'🥉',
  title:'Tercera Forma Normal: adiós a la transitividad',
  subtitle:'Ningún atributo no clave puede depender de otro atributo no clave.',
  reto:{
    q:'ID_Profesor ➡️ ID_Departamento ➡️ Nombre_Departamento. La cadena es una…',
    opts:['Dependencia funcional','Dependencia transitiva 🔗','Dependencia parcial'], ok:1,
    explain:'Es transitiva: el nombre depende de otra columna no clave. La 3NF la rompe creando la tabla Departamentos.'
  },
  chatAi:'Para alcanzar la <strong>3NF</strong> la estructura debe estar en 2NF <em>y además</em>:<br><br>➊ <strong>Sin dependencias transitivas</strong> 🔗 — la información debe depender <em>directamente</em> de la clave primaria, no "a través" de otra columna.<br><br>Imagina agregar a <strong>Profesores</strong> estos campos: <code>ID_Departamento</code> y <code>Nombre_Departamento</code>. La cadena sería:<br><br><code>ID_Profesor ➡️ ID_Departamento ➡️ Nombre_Departamento</code>',
  diagram:{
    note:'La cadena transitiva: Nombre_Departamento depende de ID_Departamento (que NO es la clave de la tabla).',
    type:'schema',
    tables:[ { name:'Profesores', icon:'👨‍🏫', columns:[
      {k:'PK',n:'ID_Profesor'},
      {k:null,n:'Nombre_Profesor'},
      {k:null,n:'ID_Departamento',flag:'dup'},
      {k:null,n:'Nombre_Departamento',flag:'bad'}
    ], note:'Rojo = dependencia transitiva 🐛' } ]
  },
  chat:you('la idea es que el ID sea la puerta para consultar los datos del departamento… y sería innecesario tener el nombre también. Si tengo id=10 y nombre="x", y edito el nombre en la tabla de departamentos, habría discrepancia: el 10 ya no sería "x" sino "y".'),
  chatAi:'Ese es justo el problema: la <strong>anomalía de actualización</strong>. Si el depto 10 cambia de nombre, habría que modificar múltiples filas, y si una no se actualiza, la base queda <strong>inconsistente</strong>.<br><br>Para cumplir la <strong>3NF</strong>: extraer los departamentos a su propia tabla.',
  clouds:['dep_transitiva','anomalia_actualizacion'],
  takeaway:'Dependencia transitiva = atributo que depende de otra columna no clave. Provoca anomalías de actualización.'
},
{
  id:'p14', phase:'tfn', emoji:'🐛',
  title:'Visualizando la anomalía de actualización',
  subtitle:'El nombre del departamento se repite fila tras fila. Cámbialo en una y la base queda rota.',
  diagram:{
    note:'El mismo depto "10" repetido: ¿qué pasa si "Ciencias" cambia de nombre?',
    type:'dataset',
    cols:['ID_Profesor','Nombre_Profesor','ID_Departamento','Nombre_Departamento'],
    rows:[
      ['1','Prof. García','10','Ciencias'],
      ['2','Prof. López','10','Ciencias'],
      ['3','Prof. Díaz','10','Ciencias'],
      ['4','Prof. Soto','20','Letras']
    ],
    warn:[3],
    pkCol:0,
    caption:'Tabla: Profesores (con dependencia transitiva con Departamentos)'
  },
  chatAi:'Esto es la <strong>anomalía de actualización</strong> en vivo. Depuración: la solución es la <strong>3NF</strong>:<br><br>• <strong>Departamentos</strong> 🏢 — ID_Departamento (PK), Nombre_Departamento<br>• <strong>Profesores</strong> 👨‍🏫 — ID_Profesor (PK), Nombre_Profesor, <strong>ID_Departamento (FK)</strong><br><br>El nombre vive en un solo lugar; el profesor solo guarda la referencia.',
  clouds:['anomalia_actualizacion','dep_transitiva','clave_foranea'],
  takeaway:'La 3NF asegura que cada dato viva una sola vez. Los departamentos merecen su propia tabla.'
},
{
  id:'p15', phase:'tfn', emoji:'🏢',
  title:'Solución 3NF: tabla Departamentos',
  subtitle:'Seis tablas. Todo atributo depende directamente de su clave primaria.',
  diagram:{
    note:'El MER final tras aplicar la 3NF: 🆕 se añade Departamentos.',
    ...MODELO_3NF,
    newTables:['Departamentos']
  },
  chatAi:'Seis tablas, todas conectadas por FK 🔗 y sin una sola dependencia transitiva. La base está en <strong>3NF</strong> 🥉: la información depende siempre y únicamente de la clave primaria.',
  clouds:['descomposicion','clave_foranea'],
  takeaway:'3NF ✅. Seis tablas, cada dato en un solo lugar, cada atributo pegadito a su clave.'
},
{
  id:'p16', phase:'tfn', emoji:'📌',
  title:'Resumen del viaje 1NF → 3NF',
  subtitle:'Las tres normas que se aplican en el 95% de los sistemas reales.',
  diagram:{
    note:'El estándar de oro del desarrollo: llegar a 3NF (o BCNF). Y el modelo va creciendo: 0 → 6 tablas.',
    type:'growth',
    bars:GROWTH
  },
  chatAi:'<strong>Resumen del proceso de normalización 📌</strong><br><br>1️⃣ <strong>1NF ⚛️</strong> — celdas con valores atómicos (sin listas) y clave primaria definida.<br>2️⃣ <strong>2NF 🧩</strong> — se eliminan dependencias parciales (atributos dependen de <em>toda</em> la clave).<br>3️⃣ <strong>3NF 🔗</strong> — se eliminan dependencias transitivas (atributos dependen <em>únicamente</em> de la clave).',
  clouds:['dep_funcional','dep_parcial','dep_transitiva'],
  takeaway:'El trío dorado: 1NF deja datos atómicos, 2NF exige dependencia total, 3NF prohíbe cadenas.'
},
{
  id:'q3nf', phase:'tfn', emoji:'🥉',
  title:'Mini-control: 3NF',
  subtitle:'Dependencias transitivas y anomalías de actualización.',
  quiz:[
    { q:'ID_Profesor ➡️ ID_Departamento ➡️ Nombre_Departamento…',
      opts:['Dependencia funcional','Dependencia transitiva 🔗','Producto cartesiano'], ok:1,
      feed:'Transitiva: Nombre_Departamento depende de otra columna no clave, no de la PK.' },
    { q:'Renombrar "Ciencias" a "Químicas" en 3 filas y olvidar una…',
      opts:['Anomalía de actualización 🐛','Filas fantasma','Pérdida de atomicidad'], ok:0,
      feed:'¡Anomalía de actualización! La base queda inconsistente. La 3NF la previene.' },
    { q:'¿Cuál es la solución 3NF para los departamentos?',
      opts:['Crear la tabla Departamentos 🏢','Duplicar el nombre','Borrar la columna FK'], ok:0,
      feed:'Cada dato vive una sola vez: Nombre_Departamento va a su tabla y Profesores solo guarda la FK.' }
  ],
  clouds:[],
  takeaway:'3NF = nada de cadenas: cada atributo cuelga directo de la clave primaria.'
},

/* ---------- AVANZADAS ---------- */
{
  id:'p17', phase:'navz', emoji:'🚀',
  title:'Las formas normales superiores',
  subtitle:'El caso ya está en 3NF; el ejercicio continúa con BCNF, 4NF, 5NF y 6NF.',
  chat:you('El caso de estudio cierra en 3NF, pero el ejercicio pide cubrir todas las formas normales: toca desarrollar también la 4NF, la 5NF y la 6NF.'),
  chatAi:'Para completar el mapa del ejercicio 🗺️:<br><br>• <strong>BCNF</strong> 🛡️ — versión ligeramente más estricta de la 3NF: maneja múltiples claves candidatas que se solapan.<br>• <strong>4NF</strong> 🔀 — elimina <strong>dependencias multivaluadas</strong>.<br>• <strong>5NF</strong> 🧩 — elimina <strong>dependencias de unión</strong> (evita filas fantasma).<br>• <strong>6NF</strong> ⏳ — descomposición al límite: cada tabla guarda la clave y un único atributo.<br><br>En la práctica, <strong>3NF o BCNF</strong> es el estándar de oro para el 95% de los sistemas.',
  diagram:{
    note:'Escalera de las formas normales avanzadas.',
    type:'journey',
    nodes:[
      { t:'3NF 🥉', d:'Punto de partida (ya aplicada)', on:true },
      { t:'BCNF 🛡️', d:'Claves candidatas solapadas' },
      { t:'4NF 🔀', d:'Dependencias multivaluadas' },
      { t:'5NF 🧩', d:'Dependencias de unión' },
      { t:'6NF ⏳', d:'Descomposición total' }
    ]
  },
  clouds:['bcnf','dep_multivaluada','dep_union'],
  takeaway:'3NF/BCNF resolvían el 95%. 4NF y 5NF atacan casos concretos de redundancia; 6NF es el límite radical.'
},
{
  id:'p18', phase:'navz', emoji:'🌀',
  title:'4NF: dependencias multivaluadas',
  subtitle:'Un estudiante, sus idiomas y sus deportes… combinados en una sola tabla.',
  reto:{
    q:'2 idiomas × 2 deportes del mismo estudiante en una sola tabla generan…',
    opts:['2 filas limpias','4 filas (producto cartesiano) ✖️','Un error de clave'], ok:1,
    explain:'2×2=4: es el producto cartesiano de la dependencia multivaluada (A ↠ B), y la 4NF lo separa.'
  },
  diagram:{
    note:'2 idiomas × 2 deportes = 4 filas para un solo estudiante. ¡Producto cartesiano!',
    type:'dataset',
    cols:['ID_Estudiante','Idioma','Deporte'],
    rows:[
      ['1','Inglés','Fútbol'],
      ['1','Inglés','Baloncesto'],
      ['1','Francés','Fútbol'],
      ['1','Francés','Baloncesto']
    ],
    warn:[1,2],
    pkCol:0,
    highlightDup:true,
    caption:'Estudiante: 2 idiomas × 2 deportes → 4 combinaciones'
  },
  chat:you('eso sería complejidad algorítmica no? un árbol de registros donde 1 estudiante tiene dos caminos y de esos dos caminos otros dos caminos.'),
  chatAi:'Efecto confirmado: se genera un <strong>producto cartesiano</strong> tipo árbol: 2 idiomas × 2 deportes = <strong>4 filas</strong> para un solo estudiante. Si hablara 4 idiomas y practicara 4 deportes… ¡16 filas redundantes!<br><br>Ese problema es la <strong>dependencia multivaluada (A ↠ B)</strong>.',
  clouds:['producto_cartesiano','dep_multivaluada'],
  takeaway:'Dos listas de 1:N independientes en la misma tabla se retorcen en producto cartesiano. La 4NF los separa.'
},
{
  id:'p19', phase:'navz', emoji:'🔀',
  title:'Solución 4NF: separar las listas',
  subtitle:'Cada lista independiente vive en su propia tabla.',
  diagram:{
    note:'Las dos tablas resuelven la dependencia multivaluada sin cruzar datos.',
    type:'schema',
    tables:[
      { name:'Estudiante_Idiomas', icon:'🌍', columns:[
        {k:'PK',n:'ID_Estudiante'},
        {k:'PK',n:'Idioma'}
      ], note:'(ID_Estudiante, Idioma) PK compuesta' },
      { name:'Estudiante_Deportes', icon:'⚽', columns:[
        {k:'PK',n:'ID_Estudiante'},
        {k:'PK',n:'Deporte'}
      ], note:'(ID_Estudiante, Deporte) PK compuesta' }
    ],
    relations:[ {from:'Estudiante_Idiomas', to:'Estudiante_Deportes', label:'independientes', dashed:true, noArrow:true} ]
  },
  chatAi:'El tratamiento de la <strong>4NF</strong> 🔀:<br><br>• <strong>Estudiante_Idiomas</strong>: <code>(ID_Estudiante, Idioma)</code><br>• <strong>Estudiante_Deportes</strong>: <code>(ID_Estudiante, Deporte)</code><br><br>La información ya no se cruza: cada estudiante aparece una vez por idioma y una vez por deporte. Adiós al producto cartesiano.',
  clouds:['dep_multivaluada','descomposicion'],
  takeaway:'4NF ✅. Listas independientes → tablas independientes. Cero cruces fantasma.'
},
{
  id:'p20', phase:'navz', emoji:'🧩',
  title:'5NF: dependencias de unión',
  subtitle:'A veces, solo se puede reconstruir el original uniendo las tres piezas a la vez.',
  reto:{
    q:'Una tabla dividida en 3 piezas que se une "a medias" produce…',
    opts:['Filas fantasma 👻','Anomalías de actualización','Redundancia inofensiva'], ok:0,
    explain:'¡Filas fantasma! Registros que no existían en el original. La 5NF garantiza que solo la unión completa reconstruya la verdad.'
  },
  diagram:{
    note:'Triángulo de relaciones: cualquiera de las dos tablas solas produce datos falsos.',
    type:'schema',
    tables:[
      { name:'Vendedor_X_Producto', icon:'💼', columns:[ {k:'PK',n:'ID_Vendedor'}, {k:'PK',n:'ID_Producto'} ] },
      { name:'Producto_X_Cliente', icon:'📦', columns:[ {k:'PK',n:'ID_Producto'}, {k:'PK',n:'ID_Cliente'} ] },
      { name:'Cliente_X_Vendedor', icon:'🤝', columns:[ {k:'PK',n:'ID_Cliente'}, {k:'PK',n:'ID_Vendedor'} ] }
    ],
    relations:[
      {from:'Vendedor_X_Producto', to:'Producto_X_Cliente', label:'comparten Producto'},
      {from:'Producto_X_Cliente', to:'Cliente_X_Vendedor', label:'comparten Cliente'},
      {from:'Cliente_X_Vendedor', to:'Vendedor_X_Producto', label:'comparten Vendedor'}
    ]
  },
  chatAi:'La <strong>5NF</strong> 🧩 (PJNF) resuelve casos donde una tabla dividida en <em>tres</em> partes solo se reconstruye correctamente si se unen las <strong>tres a la vez</strong>.<br><br>Si unes solo dos piezas, salen registros que <strong>no existían originalmente</strong>: las famosas <strong>filas fantasma</strong> 👻 (datos falsos). La quinta forma normal los previene.',
  clouds:['dep_union','filas_fantasma'],
  takeaway:'5NF ✅. Solo une las piezas correctamente, en conjunto, para no inventar datos que no existían.'
},
{
  id:'p21', phase:'navz', emoji:'⏳',
  title:'6NF: descomposición absoluta',
  subtitle:'Cada tabla guarda la clave primaria y un único atributo. Ideal para historiales y datos temporales.',
  diagram:{
    note:'Ejemplo conceptual: la clave y un solo atributo por tabla.',
    type:'schema',
    tables:[
      { name:'Cliente_Nombre', icon:'🏷️', columns:[ {k:'PK',n:'ID_Cliente'}, {k:null,n:'Nombre'} ] },
      { name:'Cliente_Direccion', icon:'📍', columns:[ {k:'PK',n:'ID_Cliente'}, {k:null,n:'Direccion'} ] },
      { name:'Cliente_Telefono', icon:'📞', columns:[ {k:'PK',n:'ID_Cliente'}, {k:null,n:'Telefono'} ] }
    ],
    relations:[
      {from:'Cliente_Nombre', to:'Cliente_Direccion', label:'clave + 1 dato'},
      {from:'Cliente_Direccion', to:'Cliente_Telefono', label:'clave + 1 dato'}
    ]
  },
  chatAi:'La <strong>6NF</strong> ⏳ lleva la descomposición al máximo: cada tabla contiene <strong>la clave primaria y un único atributo</strong>.<br><br>Se usa casi exclusivamente en <strong>bases de datos temporales</strong> ⏳: al tener cada dato en su propia tabla, se puede rastrear con precisión cómo cambia cada valor individual a lo largo del tiempo.',
  clouds:['descomposicion','temporal'],
  takeaway:'6NF = una tabla por atributo. Suena extremo, y es perfecto para historiales: rastrea cada dato por separado.'
},
{
  id:'qsup', phase:'navz', emoji:'🚀',
  title:'Mini-control: formas avanzadas',
  subtitle:'BCNF, 4NF, 5NF en tres preguntas.',
  quiz:[
    { q:'2 idiomas × 2 deportes del mismo estudiante generan…',
      opts:['2 filas','4 filas (producto cartesiano) ✖️','Imposible en una tabla'], ok:1,
      feed:'2×2=4: es la dependencia multivaluada que resuelve la 4NF.' },
    { q:'Unir a medias una descomposición en 3 partes produce…',
      opts:['Anomalías de actualización','Filas fantasma 👻','Pérdida de atomicidad'], ok:1,
      feed:'Filas fantasma: datos que no existían en el original. Ese es el terreno de la 5NF.' },
    { q:'BCNF con respecto a 3NF…',
      opts:['Es más débil','Es ligeramente más estricta 🛡️','Es lo mismo que 4NF'], ok:1,
      feed:'BCNF endurece la 3NF para claves candidatas que se solapan.' }
  ],
  clouds:[],
  takeaway:'4NF separa listas independientes, 5NF previene filas fantasma, BCNF es 3NF estricta.'
},
{
  id:'final', phase:'navz', emoji:'🏗️',
  title:'El modelo completo',
  subtitle:'De cero tablas a seis: una pieza nueva por cada forma normal.',
  diagram:{
    note:'El MER final del caso de estudio: seis tablas en 3NF, la evidencia completa.',
    ...MODELO_3NF
  },
  chatAi:'<strong>Resumen integral del caso de estudio 🏗️</strong><br><br>• <strong>1NF</strong> 🥇 — celdas atómicas, clave primaria, sin grupos repetidos.<br>• <strong>2NF</strong> 🥈 — adiós a las dependencias parciales (Profesores, Cursos, Inscripciones).<br>• <strong>3NF</strong> 🥉 — adiós a la transitividad (Departamentos).<br><br>Seis tablas conectadas por claves foráneas 🔗: así modela cualquier sistema real.',
  clouds:['descomposicion','clave_foranea'],
  takeaway:'Del caos (0 tablas) al modelo 3NF (6 tablas): la evidencia completa de la normalización.'
},

/* ---------- REPASO ---------- */
{
  id:'quiz', phase:'navz', emoji:'🎯',
  title:'Repaso exprés',
  subtitle:'Pon a prueba lo aplicado en el ejercicio. Responde y recibe feedback al instante.',
  quiz:[
    { q:'1. Una celda con "Matemáticas, Física, Química" viola…',
      opts:['La atomicidad ⚛️','La clave primaria','Los grupos repetidos'], ok:0,
      feed:'¡Exacto, es atomicidad! Listas en una celda = 1NF rota. Los grupos repetidos serían columnas tipo Tel1/Tel2/Tel3.' },
    { q:'2. Tras separar los cursos, la clave primaria correcta es…',
      opts:['Solo ID_Estudiante','(ID_Estudiante, Curso)','Nombre + Teléfono'], ok:1,
      feed:'Correcto: la clave compuesta (ID_Estudiante, Curso) desempata las filas repetidas de Ana.' },
    { q:'3. Nombre_Profesor dentro de Inscripciones rompe la 2NF porque…',
      opts:['Depende de toda la clave compuesta','Es una lista multivaluada','Depende solo de ID_Curso (dependencia parcial)'], ok:2,
      feed:'¡Justo! El profesor pertenece al curso, así que depende solo de una parte de la clave. Sale a su propia tabla.' },
    { q:'4. La cadena ID_Profesor ➡️ ID_Departamento ➡️ Nombre_Departamento es…',
      opts:['Una dependencia funcional','Una dependencia transitiva 🔗','Un producto cartesiano'], ok:1,
      feed:'Es transitiva: el nombre depende de otra columna no clave. La 3NF la elimina creando la tabla Departamentos.' },
    { q:'5. 2 idiomas × 2 deportes en la misma tabla generan…',
      opts:['4 filas y redundancia (producto cartesiano)','2 filas limpias','Imposible guardarlo'], ok:0,
      feed:'Efecto: 2×2 = 4 filas. Eso es la dependencia multivaluada que ataca la 4NF.' },
    { q:'6. La 5NF previene…',
      opts:['Anomalías de actualización','Las filas fantasma 👻','La pérdida de indexación'], ok:1,
      feed:'¡Sí! Al unir mal una descomposición en 3 partes aparecen filas fantasma (datos falsos). La 5NF lo evita.' }
  ],
  clouds:[],
  takeaway:'¡Listo! De una tabla caótica a un modelo en 3NF/BCNF con 5-6 tablas, y el mapa completo hasta 6NF. Repásalo las veces que quieras. 🎉'
},

/* ---------- EXAMEN FINAL ---------- */
{
  id:'exam', phase:'navz', emoji:'🏁',
  title:'Examen de dominio',
  subtitle:'13 preguntas que cubren todo el caso: 1NF → 6NF. Sin feedback hasta entregar.',
  exam:[
    { fn:'1NF', q:'Una celda con "Matemáticas, Física, Química" viola directamente…',
      opts:['La atomicidad de la 1NF ⚛️','La dependencia transitiva','La dependencia multivaluada'], ok:0,
      feed:'Listas en una celda = 1NF rota. Grupos repetidos serían columnas Tel1/Tel2/Tel3.' },
    { fn:'1NF', q:'En la relación estudiante → teléfonos (1:N), la FK se coloca…',
      opts:['En Estudiantes (lado 1)','En Telefonos (lado N) 📞','En ambas tablas'], ok:1,
      feed:'La FK vive siempre en el lado "muchos": ID_Estudiante dentro de Telefonos.' },
    { fn:'2NF', q:'Con clave (ID_Estudiante, ID_Curso), Nombre_Profesor dentro de Inscripciones…',
      opts:['Depende de toda la clave','Depende solo de ID_Curso: dependencia parcial ✂️','Es una dependencia transitiva'], ok:1,
      feed:'Depende de una parte de la clave compuesta → 2NF violada. Su hogar es la tabla Cursos (FK ID_Profesor).' },
    { fn:'2NF', q:'¿Por qué Nota_Final SÍ cumple la 2NF en Inscripciones?',
      opts:['Porque es un número','Porque depende de la pareja completa (estudiante + curso) ✅','Porque es la PK'], ok:1,
      feed:'Necesitas saber quién la obtuvo y en qué curso: depende de toda la clave compuesta.' },
    { fn:'2NF', q:'Nombre_Curso dentro de Inscripciones, tras pasar por la 2NF, termina…',
      opts:['En Cursos (tabla propia) 📚','Siguiendo en Inscripciones','Duplicado en Profesores'], ok:0,
      feed:'Dependía solo de ID_Curso → dependencia parcial → la 2NF lo mudó a la tabla Cursos.' },
    { fn:'3NF', q:'La cadena ID_Profesor ➡️ ID_Departamento ➡️ Nombre_Departamento es…',
      opts:['Una dependencia funcional simple','Una dependencia transitiva 🔗','Una dependencia parcial'], ok:1,
      feed:'El nombre depende de otra columna no clave. La 3NF lo rompe creando la tabla Departamentos.' },
    { fn:'3NF', q:'Si el depto 10 "Ciencias" cambia de nombre y solo se actualiza 1 de 3 filas…',
      opts:['Nada, es normal','Anomalía de actualización: base inconsistente 🐛','Se pierde la atomicidad'], ok:1,
      feed:'Es la anomalía clásica que previene la 3NF: cada dato debe vivir en un solo lugar.' },
    { fn:'BCNF', q:'BCNF con respecto a la 3NF…',
      opts:['Es más débil','Es más estricta: toda clave candidata debe ser superclave 🛡️','Es lo mismo que 4NF'], ok:1,
      feed:'BCNF endurece la 3NF para claves candidatas que se solapan (p.ej. Compañía-Proyecto-Empleado).' },
    { fn:'BCNF', q:'¿En qué caso se nota la diferencia entre 3NF y BCNF?',
      opts:['Cuando hay claves candidatas solapadas','Cuando hay listas en celdas','Cuando hay columnas Tel1/Tel2'], ok:0,
      feed:'Cuando dos claves candidatas comparten atributos, la 3NF puede tolerar un no-clave determinante; BCNF no.' },
    { fn:'4NF', q:'2 idiomas × 2 deportes del mismo estudiante en una tabla generan…',
      opts:['2 filas limpias','4 filas por producto cartesiano ✖️','Un error de clave'], ok:1,
      feed:'2×2=4: dependencia multivaluada (A ↠ B). La 4NF separa cada lista en su propia tabla.' },
    { fn:'5NF', q:'Unir a medias una descomposición en 3 piezas produce…',
      opts:['Filas fantasma 👻','Anomalías de actualización','Pérdida de atomicidad'], ok:0,
      feed:'Filas fantasma: registros falsos que no existían en el original. Ese es el terreno de la 5NF.' },
    { fn:'6NF', q:'La 6NF descompone la tabla hasta…',
      opts:['Dos columnas por tabla','La clave primaria + un único atributo ⏳','Todas las claves foráneas'], ok:1,
      feed:'Una tabla por atributo: ideal para historiales temporales donde cada dato cambia a su ritmo.' },
    { fn:'3NF', q:'En la práctica, ¿hasta qué forma normal se lleva el 95% de los sistemas?',
      opts:['1NF','3NF o BCNF 🏅','6NF'], ok:1,
      feed:'3NF/BCNF es el estándar de oro: elimina redundancia peligrosa sin fragmentar en exceso.' }
  ],
  clouds:[],
  takeaway:'Examen completo: 13 preguntas desde atomicidad hasta 6NF. Revisa el desglose por forma normal y repasa los bloques marcados.'
}
];

/* ---------- MER evolutivo: estados por hito del ejercicio ---------- */
const D = id => STEPS.find(s=>s.id===id).diagram;
const MER_STATES = [
  { at:'p0', label:'En bruto', desc:'1 tabla · listas dentro de las celdas', schema:{
    tables:[ { name:'InscripcionEstudiantes', icon:'💥', columns:[
      {k:'PK',n:'ID_Estudiante'},
      {k:null,n:'Nombre'},
      {k:null,n:'Cursos_Inscritos',flag:'bad'},
      {k:null,n:'Telefono_Contacto',flag:'bad'}
    ], note:'Estado inicial: todo en una sola tabla' } ]
  }},
  { at:'p4', label:'Atomicidad aplicada', desc:'1 tabla · clave primaria compuesta', schema:D('p5') },
  { at:'p7', label:'1NF ✅', desc:'3 tablas · celdas atómicas y FK', schema:D('p7') },
  { at:'p8', label:'2NF en curso', desc:'3 tablas · dependencias parciales en rojo', schema:{
    newTables:['Inscripciones'],
    tables:[
      { name:'Estudiantes', icon:'👤', columns:[ {k:'PK',n:'ID_Estudiante'}, {k:null,n:'Nombre'} ] },
      { name:'Telefonos', icon:'📞', columns:[ {k:'PK',n:'ID_Telefono'}, {k:null,n:'Numero'}, {k:'FK',n:'ID_Estudiante'} ] },
      { name:'Inscripciones', icon:'📝', columns:[
        {k:'PK',n:'ID_Estudiante'}, {k:'PK',n:'ID_Curso'},
        {k:null,n:'Nombre',flag:'bad'}, {k:null,n:'Nombre_Curso',flag:'bad'},
        {k:null,n:'Nombre_Profesor',flag:'bad'}, {k:null,n:'Nota_Final',flag:'good'}
      ], note:'Concentra datos de otros: la 2NF la separará' }
    ],
    relations:[
      {from:'Telefonos', to:'Estudiantes', label:'N : 1'},
      {from:'Inscripciones', to:'Estudiantes', label:'N : 1'}
    ]
  }},
  { at:'p11', label:'2NF ✅', desc:'5 tablas · cero dependencias parciales', schema:D('p12') },
  { at:'p13', label:'3NF pendiente', desc:'5 tablas · transitividad aún en Profesores', schema:{
    tables:D('p12').tables.map(t=> t.name!=='Profesores' ? t : {
      name:'Profesores', icon:'👨‍🏫',
      columns:[ {k:'PK',n:'ID_Profesor'}, {k:null,n:'Nombre_Profesor'}, {k:null,n:'ID_Departamento',flag:'dup'}, {k:null,n:'Nombre_Departamento',flag:'bad'} ],
      note:'La dependencia transitiva vive aquí (todavía)'
    }),
    relations:D('p12').relations
  }},
  { at:'p15', label:'3NF ✅', desc:'6 tablas · sin dependencias transitivas', schema:{...MODELO_3NF, newTables:['Departamentos']} },
  { at:'p19', label:'4NF', desc:'8 tablas · cada lista en su propia tabla', schema:{
    tables:[ ...MODELO_3NF.tables,
      { name:'Estudiante_Idiomas', icon:'🌍', columns:[ {k:'PK',n:'ID_Estudiante'}, {k:'PK',n:'Idioma'} ] },
      { name:'Estudiante_Deportes', icon:'⚽', columns:[ {k:'PK',n:'ID_Estudiante'}, {k:'PK',n:'Deporte'} ] }
    ],
    relations:[ ...MODELO_3NF.relations,
      {from:'Estudiante_Idiomas', to:'Estudiantes', label:'N : 1'},
      {from:'Estudiante_Deportes', to:'Estudiantes', label:'N : 1'}
    ],
    newTables:['Estudiante_Idiomas','Estudiante_Deportes']
  }},
  { at:'p20', label:'5NF', desc:'3 tablas · ejemplo (vendedor · producto · cliente)', schema:D('p20') },
  { at:'p21', label:'6NF', desc:'3 tablas · ejemplo (clave + 1 atributo)', schema:D('p21') },
  { at:'final', label:'Modelo final', desc:'6 tablas · 3NF del caso de estudio', schema:MODELO_3NF }
];
MER_STATES.forEach(s=>{ s.idx = STEPS.findIndex(st=>st.id===s.at); });
function merFor(idx){
  let st=MER_STATES[0];
  for(const m of MER_STATES){ if(m.idx<=idx) st=m; else break; }
  return st;
}

/* ---------- helpers ---------- */
function you(t){ return { speaker:'you', text:t }; }
function chatFor(s){
  const items=[];
  if(s.chat) items.push(s.chat);
  if(s.chatAi) items.push({speaker:'ai', text:s.chatAi});
  if(s.chatAi2) items.push({speaker:'ai', text:s.chatAi2});
  return items;
}

/* ---------- estado ---------- */
const state = { cur: 0, reto:{}, quiz:{}, exam:null, repaso:false, lastSeen:null };
const refState = { tab:'cheat', q:'', focus:null, flash:{ i:0, order:[], flipped:false } };
const el = id => document.getElementById(id);

/* ---------- render: esquema (MER) ---------- */
function edgePoint(box, tx, ty){
  const dx=tx-box.cx, dy=ty-box.cy;
  if(dx===0 && dy===0) return {x:box.cx, y:box.cy};
  const sx = dx===0? Infinity : (box.w/2+2)/Math.abs(dx);
  const sy = dy===0? Infinity : (box.h/2+2)/Math.abs(dy);
  const s=Math.min(sx, sy);
  return { x:box.cx+dx*s, y:box.cy+dy*s };
}
/* candidatos de curva: primero la directa, luego desviadas para
   rodear entidades intermedias sin que la línea parezca otra relación */
function curveCandidates(p1,p2){
  const dx=p2.x-p1.x, dy=p2.y-p1.y;
  const horiz=Math.abs(dx)>=Math.abs(dy);
  const span=horiz?Math.abs(dx):Math.abs(dy);
  const base=Math.max(28, Math.min(70, span/2));
  const out=[];
  if(horiz){
    const s=dx>=0?1:-1;
    out.push([{x:p1.x+base*s,y:p1.y},{x:p2.x-base*s,y:p2.y}]);
    out.push([{x:p1.x+base*1.9*s,y:p1.y},{x:p2.x-base*1.9*s,y:p2.y}]);
    const off=Math.max(46, Math.abs(dy)/2+40);
    out.push([{x:p1.x,y:p1.y+off},{x:p2.x,y:p2.y+off}]);
    out.push([{x:p1.x,y:p1.y-off},{x:p2.x,y:p2.y-off}]);
    out.push([{x:p1.x,y:p1.y+off*1.8},{x:p2.x,y:p2.y+off*1.8}]);
    out.push([{x:p1.x,y:p1.y-off*1.8},{x:p2.x,y:p2.y-off*1.8}]);
  }else{
    const s=dy>=0?1:-1;
    out.push([{x:p1.x,y:p1.y+base*s},{x:p2.x,y:p2.y-base*s}]);
    out.push([{x:p1.x,y:p1.y+base*1.9*s},{x:p2.x,y:p2.y-base*1.9*s}]);
    const off=Math.max(46, Math.abs(dx)/2+40);
    out.push([{x:p1.x+off,y:p1.y},{x:p2.x+off,y:p2.y}]);
    out.push([{x:p1.x-off,y:p1.y},{x:p2.x-off,y:p2.y}]);
    out.push([{x:p1.x+off*1.8,y:p1.y},{x:p2.x+off*1.8,y:p2.y}]);
    out.push([{x:p1.x-off*1.8,y:p1.y},{x:p2.x-off*1.8,y:p2.y}]);
  }
  return out;
}
function curveGeom(p1,p2,c1,c2){
  const pts=[];
  for(let i=0;i<=36;i++){
    const t=i/36, u=1-t;
    pts.push({
      x:u*u*u*p1.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*p2.x,
      y:u*u*u*p1.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*p2.y
    });
  }
  return {
    d:`M ${p1.x},${p1.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`,
    pts, mid:pts[18]
  };
}
function hitsCount(pts,obs){
  let n=0;
  for(const pt of pts){
    for(const rc of obs){
      if(pt.x>rc.x&&pt.x<rc.x+rc.w&&pt.y>rc.y&&pt.y<rc.y+rc.h){ n++; break; }
    }
  }
  return n;
}
/* elige la curva que menos se entrecruza con otras entidades */
function pickCurve(p1,p2,obs){
  let best=null,bestN=Infinity;
  for(const [c1,c2] of curveCandidates(p1,p2)){
    const g=curveGeom(p1,p2,c1,c2);
    const n=hitsCount(g.pts,obs);
    if(n===0) return g;
    if(n<bestN){ bestN=n; best=g; }
  }
  return best;
}
function renderSchema(d, target){
  const canvas = target || el('canvas');
  canvas.innerHTML='';
  canvas.style.height='';
  canvas.style.minWidth='';
  const tables = d.tables||[];
  if(!tables.length){ canvas.innerHTML='<div class="no-diagram"></div>'; return; }

  const n=tables.length;
  const cols = n<=3? n : (n===4?2:3);
  const TW=258, GAP=Math.max(84, Math.min(140, 108)), PADH=44, PADV=38, gapY=52;
  const rows = Math.ceil(n/cols);
  const totalW = cols*TW+(cols-1)*GAP;
  const avail = canvas.clientWidth||900;
  const needed = totalW+PADH*2;
  if(needed>avail) canvas.style.minWidth=needed+'px';
  const W = Math.max(avail, needed);
  const startLeft = Math.max(PADH, Math.round((W-totalW)/2));

  const nodes=tables.map((t,i)=>{
    const c=i%cols;
    const isNew=(d.newTables||[]).includes(t.name);
    const div=document.createElement('div');
    div.className='entity ent-in'+(isNew?' fresh':'');
    div.dataset.name=t.name;
    div.style.width=TW+'px';
    div.style.left=(startLeft+c*(TW+GAP))+'px';
    div.style.top=PADV+'px';
    div.style.setProperty('--i',i);
    let html=`<div class="head">${t.icon||'🗄️'} ${escapeHtml(t.name)}<span class="pill${isNew?' pill-new':''}">${isNew?'🆕 NUEVA':'ENTIDAD'}</span></div>`;
    (t.columns||[]).forEach(col=>{
      let k='';
      if(col.k==='PK') k='<span class="k pk">PK</span>';
      else if(col.k==='FK') k='<span class="k fk">FK</span>';
      const flag = col.flag==='bad'?'k bad':(col.flag==='good'?'k good':(col.flag==='dup'?'k dup':''));
      const badge = flag?`<span class="${flag}">${col.flag==='bad'?'✗':col.flag==='good'?'✓':'✦'}</span>`:'';
      html+=`<div class="row">${badge}<span>${escapeHtml(col.n)}</span>${k}</div>`;
    });
    if(t.note) html+=`<div class="foot">${escapeHtml(t.note)}</div>`;
    div.innerHTML=html;
    div.addEventListener('animationend',()=>div.classList.remove('ent-in'),{once:true});
    canvas.appendChild(div);
    return div;
  });

  requestAnimationFrame(()=>{
    // posiciones con alturas reales: centrar verticalmente cada fila y el conjunto
    const heights=nodes.map(e=>e.offsetHeight);
    const rowH=[]; const rowTop=[]; let y=PADV;
    for(let r=0;r<rows;r++){
      let h=0;
      for(let c=0;c<cols;c++){ const i=r*cols+c; if(i<n) h=Math.max(h,heights[i]); }
      rowH[r]=h; rowTop[r]=y; y+=h+gapY;
    }
    const canvasH=(rows>0? rowTop[rows-1]+rowH[rows-1]+PADV : 240);
    canvas.style.height=Math.max(240,canvasH)+'px';
    nodes.forEach((e,i)=>{
      const r=Math.floor(i/cols), c=i%cols;
      e.style.left=(startLeft+c*(TW+GAP))+'px';
      e.style.top=(rowTop[r]+(rowH[r]-heights[i])/2)+'px';
    });

    // medir centros y bordes
    const box=canvas.getBoundingClientRect();
    const pos={};
    nodes.forEach(e=>{
      const b=e.getBoundingClientRect();
      const cx=b.left-box.left+b.width/2, cy=b.top-box.top+b.height/2;
      pos[e.dataset.name]={ cx, cy, w:b.width, h:b.height };
    });

    const rels=d.relations||[];
    if(!rels.length) return;
    const NS='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(NS,'svg');
    svg.setAttribute('class','rels');
    svg.setAttribute('width','100%'); svg.setAttribute('height','100%');
    const defs=document.createElementNS(NS,'defs');
    ['arrow','arrow-grey'].forEach((id,ix)=>{
      const mk=document.createElementNS(NS,'marker');
      mk.setAttribute('id',id);
      mk.setAttribute('viewBox','0 0 10 10');
      mk.setAttribute('refX','9'); mk.setAttribute('refY','5');
      mk.setAttribute('markerWidth','7'); mk.setAttribute('markerHeight','7');
      mk.setAttribute('orient','auto-start-reverse');
      const p=document.createElementNS(NS,'path');
      p.setAttribute('d','M0,0 L10,5 L0,10 z');
      p.setAttribute('fill', ix? '#94a3b8':'#7dd3fc');
      mk.appendChild(p); defs.appendChild(mk);
    });
    svg.appendChild(defs);

    const labels=document.createElement('div');
    labels.className='rel-labels';
    const labelRects=[];

    rels.forEach(r=>{
      const A=pos[r.from], B=pos[r.to];
      if(!A||!B) return;
      const grey=r.dashed?' grey':'';
      const p1=edgePoint(A,B.cx,B.cy);
      const p2=edgePoint(B,A.cx,A.cy);
      // obstáculos: el resto de entidades (no los extremos de esta relación)
      const obs=Object.entries(pos)
        .filter(([name])=>name!==r.from && name!==r.to)
        .map(([,b])=>({x:b.cx-b.w/2-10, y:b.cy-b.h/2-10, w:b.w+20, h:b.h+20}));
      const g=pickCurve(p1,p2,obs);
      const dPath=g.d;
      const base=document.createElementNS(NS,'path');
      base.setAttribute('d',dPath);
      base.setAttribute('class','l'+grey);
      if(!r.noArrow) base.setAttribute('marker-end',`url(#${r.dashed?'arrow-grey':'arrow'})`);
      svg.appendChild(base);
      const flow=document.createElementNS(NS,'path');
      flow.setAttribute('d',dPath);
      flow.setAttribute('class','flow'+grey);
      flow.style.animationDelay=(-Math.random()*2).toFixed(2)+'s';
      svg.appendChild(flow);
      if(r.label){
        const dx=p2.x-p1.x, dy=p2.y-p1.y;
        const len=Math.hypot(dx,dy)||1;
        const perp={x:-dy/len, y:dx/len};
        const estW=r.label.length*6.7+26, halfW=estW/2, halfH=13;
        const rects=Object.values(pos).map(b=>({x:b.cx-b.w/2, y:b.cy-b.h/2, w:b.w, h:b.h}));
        const overlaps=(p,w,h,extra)=>rects.some(rc=>
          p.x+w>rc.x-extra && p.x-w<rc.x+rc.w+extra &&
          p.y+h>rc.y-extra && p.y-h<rc.y+rc.h+extra) ||
          labelRects.some(rc=>
          p.x+w>rc.x-6 && p.x-w<rc.x+rc.w+6 &&
          p.y+h>rc.y-4 && p.y-h<rc.y+rc.h+4);
        const clear=p=>!overlaps(p,halfW,halfH,8);
        // punto sobre la curva elegida, no el centro del segmento recto
        const mid=g.mid;
        let lp=mid;
        if(!clear(mid)){
          const offs=[0];
          [18,36,54,72,90,108,126,144].forEach(v=>{offs.push(v,-v);});
          for(const o of offs){
            const cand={x:mid.x+perp.x*o, y:mid.y+perp.y*o};
            if(cand.y>=halfH+4 && cand.y<=canvasH-halfH-4 && clear(cand)){ lp=cand; break; }
          }
        }
        const lab=document.createElement('div');
        lab.className='rel-label'+grey;
        lab.textContent=r.label;
        lab.style.left=lp.x+'px'; lab.style.top=lp.y+'px';
        labels.appendChild(lab);
        labelRects.push({x:lp.x-halfW, y:lp.y-halfH, w:halfW*2, h:halfH*2});
      }
    });
    canvas.appendChild(svg);
    canvas.appendChild(labels);
  });
}

/* ---------- render: tabla de datos ---------- */
function renderDataset(d){
  const canvas=el('canvas');
  canvas.innerHTML='';
  const wrap=document.createElement('div');
  wrap.className='dataset';
  let html=`<table>`;
  if(d.caption) html+=`<caption>${escapeHtml(d.caption)}</caption>`;
  html+='<thead><tr>';
  d.cols.forEach((c,i)=>{
    html+=`<th class="${d.warn&&d.warn.includes(i)?'warn':''}">${escapeHtml(c)}</th>`;
  });
  html+='</tr></thead><tbody>';
  (d.rows||[]).forEach(row=>{
    html+=`<tr${d.highlightDup?' class="dup-row"':''}>`;
    row.forEach((v,i)=>{
      let cls='';
      if(i===d.pkCol) cls+=' pk';
      if(d.warn&&d.warn.includes(i)) cls+=' bad';
      const warnTag=d.warn&&d.warn.includes(i)?`<span class="pill">⚠ lista</span>`:'';
      html+=`<td class="${cls}">${escapeHtml(v)}${warnTag}</td>`;
    });
    html+='</tr>';
  });
  html+='</tbody>';
  if(d.foot) html+=`<tfoot><tr><td colspan="${d.cols.length}">${escapeHtml(d.foot)}</td></tr></tfoot>`;
  html+='</table>';
  wrap.innerHTML=html;
  canvas.appendChild(wrap);
}

/* ---------- render: evolución (growth) ---------- */
function renderGrowth(d){
  const canvas=el('canvas');
  canvas.innerHTML='';
  const wrap=document.createElement('div');
  wrap.className='growth';
  const max=Math.max(1, ...(d.bars||[]).map(b=>b.n));
  wrap.innerHTML=(d.bars||[]).map((b,i)=>`
    <div class="gcol" style="--gc:${b.c};--i:${i}">
      <div class="gn">${b.n}</div>
      <div class="gbar"><div class="gfill" style="height:${Math.round(b.n/max*100)}%"></div></div>
      <div class="gl">${escapeHtml(b.label)}</div>
    </div>`).join('');
  canvas.appendChild(wrap);
}

/* ---------- render: journey ---------- */
function renderJourney(d){
  const canvas=el('canvas');
  canvas.innerHTML='';
  const wrap=document.createElement('div');
  wrap.className='journey';
  let html='';
  (d.nodes||[]).forEach((nd,i)=>{
    if(i>0) html+='<div class="jarrow">➜</div>';
    html+=`<div class="jnode" style="border-color:${nd.on?'var(--green)':'var(--line)'}">`;
    html+=`<div class="jt">${nd.t}${nd.on?' <span style="color:var(--green)">●</span>':''}</div>`;
    html+=`<div class="jd">${escapeHtml(nd.d)}</div></div>`;
  });
  wrap.innerHTML=html;
  canvas.appendChild(wrap);
}

/* ---------- render: quiz ---------- */
function renderQuiz(step){
  const canvas=el('canvas');
  canvas.innerHTML='';
  const wrap=document.createElement('div');
  wrap.className='quiz';
  step.quiz.forEach((qq,qi)=>{
    const card=document.createElement('div');
    card.className='qq';
    card.innerHTML=`<div class="q-t">${escapeHtml(qq.q)}</div><div class="qopts"></div><div class="q-feed">${escapeHtml(qq.feed)}</div>`;
    const box=card.querySelector('.qopts');
    qq.opts.forEach((op,oi)=>{
      const b=document.createElement('button');
      b.className='qopt'; b.textContent=op;
      b.dataset.qi=qi; b.dataset.oi=oi;
      box.appendChild(b);
    });
    wrap.appendChild(card);
  });
  canvas.appendChild(wrap);
  const answer=(qi,oi,card,b)=>{
    const qq=step.quiz[qi];
    state.quiz[step.id+':'+qi]=oi;
    saveProgress();
    card.classList.add('answered');
    card.querySelectorAll('.qopt').forEach((bb,ii)=>{
      bb.disabled=true;
      if(ii===qq.ok) bb.classList.add('correct');
      else if(bb===b) bb.classList.add('wrong');
    });
    if(qq.ok===oi) card.classList.add('good');
    card.querySelector('.q-feed').style.display='block';
    updateQuizScore(step);
  };
  canvas.querySelectorAll('.qopt').forEach(b=>{
    b.addEventListener('click',()=>{
      const qi=+b.dataset.qi, oi=+b.dataset.oi;
      const card=b.closest('.qq');
      if(card.classList.contains('answered')) return;
      answer(qi,oi,card,b);
    });
  });
  // restaura respuestas persistidas
  const cards=wrap.querySelectorAll('.qq');
  step.quiz.forEach((qq,qi)=>{
    const prev=state.quiz[step.id+':'+qi];
    if(prev==null) return;
    const card=cards[qi];
    const b=card&&card.querySelectorAll('.qopt')[prev];
    if(b) answer(qi,prev,card,b);
  });
  updateQuizScore(step);
}
/* marcador del mini-control: x/y aciertos + nº de fallos pendientes */
function updateQuizScore(step){
  const wrap=el('canvas').querySelector('.quiz');
  if(!wrap) return;
  let done=0, ok=0;
  step.quiz.forEach((qq,qi)=>{
    const a=state.quiz[step.id+':'+qi];
    if(a==null) return;
    done++;
    if(a===qq.ok) ok++;
  });
  let bar=wrap.querySelector('.quiz-score');
  if(!bar){
    bar=document.createElement('div');
    bar.className='quiz-score';
    wrap.prepend(bar);
  }
  bar.innerHTML= done<step.quiz.length
    ? `Respondidas <b>${done}</b> / ${step.quiz.length}`
    : `Resultado <b class="${ok===step.quiz.length?'win':''}">${ok} / ${step.quiz.length}</b> ${ok===step.quiz.length?'✓ perfecto':'· repasa los marcados en rojo'}`;
}

/* ---------- render: examen final ---------- */
function renderExam(step){
  const canvas=el('canvas');
  canvas.innerHTML='';
  const ex=state.exam||(state.exam={ans:{},submitted:false});
  if(ex.submitted && ex.score){ renderExamResult(step); return; }
  ex.submitted=false;

  const wrap=document.createElement('div');
  wrap.className='exam';
  step.exam.forEach((q,qi)=>{
    const card=document.createElement('div');
    card.className='qq ex-q';
    card.innerHTML=`<div class="q-t"><span class="q-num">${qi+1}</span>${escapeHtml(q.q)}<span class="fn-tag" data-fn="${q.fn}">${q.fn}</span></div><div class="qopts"></div>`;
    const box=card.querySelector('.qopts');
    q.opts.forEach((op,oi)=>{
      const b=document.createElement('button');
      b.className='qopt'+(ex.ans[qi]===oi?' sel':'');
      b.textContent=op;
      b.addEventListener('click',()=>{
        ex.ans[qi]=oi;
        saveProgress();
        box.querySelectorAll('.qopt').forEach((bb,ii)=>bb.classList.toggle('sel',ii===oi));
        updateExamBar(step);
      });
      box.appendChild(b);
    });
    wrap.appendChild(card);
  });
  const bar=document.createElement('div');
  bar.className='exam-bar';
  bar.innerHTML=`<span class="exam-count"></span><button class="btn btn-primary" id="examSubmit">Entregar examen 🎯</button>`;
  wrap.appendChild(bar);
  canvas.appendChild(wrap);
  bar.querySelector('#examSubmit').addEventListener('click',()=>submitExam(step));
  updateExamBar(step);
}
function updateExamBar(step){
  const ex=state.exam;
  const done=step.exam.filter((_,qi)=>ex.ans[qi]!=null).length;
  const total=step.exam.length;
  const cnt=el('canvas').querySelector('.exam-count');
  if(cnt) cnt.innerHTML= done<total
    ? `Respondidas <b>${done}</b> / ${total}`
    : `<b class="ready">${total} / ${total} listas</b> · puedes entregar`;
  const btn=el('canvas').querySelector('#examSubmit');
  if(btn) btn.disabled=done<total;
}
function submitExam(step){
  const ex=state.exam;
  let ok=0;
  const byFn={};
  step.exam.forEach((q,qi)=>{
    const a=ex.ans[qi];
    const good=a===q.ok;
    if(good) ok++;
    if(!byFn[q.fn]) byFn[q.fn]={ok:0,total:0};
    byFn[q.fn].total++;
    if(good) byFn[q.fn].ok++;
  });
  ex.submitted=true;
  ex.score={ok,total:step.exam.length};
  ex.byFn=byFn;
  ex.wrong=step.exam.map((q,qi)=>({qi,fn:q.fn,good:ex.ans[qi]===q.ok})).filter(w=>!w.good).map(w=>w.qi);
  saveProgress();
  renderExam(step);
}
const FN_STEP={ '1NF':'p7', '2NF':'p12', '3NF':'p16', 'BCNF':'p17', '4NF':'p18', '5NF':'p20', '6NF':'p21' };
function examSummaryText(step){
  const ex=state.exam;
  const {ok,total}=ex.score;
  const pct=Math.round(ok/total*100);
  const order=['1NF','2NF','3NF','BCNF','4NF','5NF','6NF'];
  const fns=order.filter(fn=>ex.byFn[fn]).map(fn=>{
    const b=ex.byFn[fn];
    return `${fn} ${b.ok===b.total?'✓':'✗ '+b.ok+'/'+b.total}`;
  }).join(' · ');
  const failed=order.filter(fn=>ex.byFn[fn]&&ex.byFn[fn].ok<ex.byFn[fn].total);
  return `Examen de Normalización — ${ok}/${total} (${pct}%)\n${fns}`+
    (failed.length? `\nBloques a repasar: ${failed.join(', ')}` : '\nTodos los bloques correctos ✓');
}
function renderExamResult(step){
  const canvas=el('canvas');
  const ex=state.exam;
  const {ok,total}=ex.score;
  const pct=Math.round(ok/total*100);
  const label= pct>=90? {t:'Dominio sólido 🏅',c:'var(--green)'}
            : pct>=70? {t:'Buen dominio 🟢',c:'var(--cyan)'}
            : pct>=50? {t:'En camino 🟡',c:'var(--amber)'}
                     : {t:'Repaso necesario 🔁',c:'var(--rose)'};
  const order=['1NF','2NF','3NF','BCNF','4NF','5NF','6NF'];
  let fnChips='';
  order.filter(fn=>ex.byFn[fn]).forEach(fn=>{
    const b=ex.byFn[fn];
    const good=b.ok===b.total;
    fnChips+=`<button class="fn-chip ${good?'ok':'bad'}" data-step="${FN_STEP[fn]}" title="${good?'Repasar':'Ir al repaso'}: ${b.ok}/${b.total}">
      <b>${fn}</b><span>${good?'✓':b.ok+'/'+b.total}</span></button>`;
  });
  let wrongList='';
  if(ex.wrong.length){
    wrongList='<div class="wrong-title">Preguntas a repasar</div>';
    ex.wrong.forEach(qi=>{
      const q=step.exam[qi];
      wrongList+=`<div class="wrong-item"><div class="w-q"><span class="fn-tag" data-fn="${q.fn}">${q.fn}</span>${escapeHtml(q.q)}</div>
        <div class="w-a">Tu respuesta: <b>${escapeHtml(q.opts[ex.ans[qi]]??'sin responder')}</b></div>
        <div class="w-ok">Correcta: <b>${escapeHtml(q.opts[q.ok])}</b> · ${escapeHtml(q.feed)}</div></div>`;
    });
  }
  canvas.innerHTML=`<div class="exam-result">
    <div class="res-top">
      <svg class="ring" viewBox="0 0 120 120" width="132" height="132" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke="${label.c}" stroke-width="10"
          stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="326.7"
          transform="rotate(-90 60 60)" class="ring-fill" style="--off:${(326.7*(1-pct/100)).toFixed(1)};animation-delay:.15s"/>
        <text x="60" y="56" text-anchor="middle" class="ring-pct">${pct}%</text>
        <text x="60" y="76" text-anchor="middle" class="ring-sub">${ok} de ${total}</text>
      </svg>
      <div class="res-info">
        <div class="res-label" style="color:${label.c}">${label.t}</div>
        <div class="fn-chips">${fnChips}</div>
        <div class="res-actions">
          <button class="btn btn-primary" id="copyRes">📋 Copiar resumen</button>
          <button class="btn" id="retryExam">🔁 Reintentar</button>
        </div>
        <div class="copy-hint" id="copyHint" hidden>✓ Resumen copiado: pégalo en tu correo o chat</div>
      </div>
    </div>
    ${wrongList}
  </div>`;
  canvas.querySelectorAll('.fn-chip[data-step]').forEach(b=>{
    b.addEventListener('click',()=>goto(STEPS.findIndex(s=>s.id===b.dataset.step)));
  });
  canvas.querySelector('#retryExam').addEventListener('click',()=>{
    state.exam={ans:{},submitted:false};
    saveProgress();
    renderExam(step);
  });
  canvas.querySelector('#copyRes').addEventListener('click',e=>{
    const txt=examSummaryText(step);
    const done=()=>{
      const hint=el('copyHint');
      hint.hidden=false;
      e.target.textContent='✓ Copiado';
      setTimeout(()=>{ hint.hidden=true; e.target.textContent='📋 Copiar resumen'; },2600);
    };
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done).catch(()=>fallbackCopy(txt,done));
    } else fallbackCopy(txt,done);
  });
}
function fallbackCopy(txt,cb){
  const ta=document.createElement('textarea');
  ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); cb(); }catch(e){}
  document.body.removeChild(ta);
}

/* ---------- render: diagrama según tipo ---------- */
function renderDiagram(step){
  const d=step.diagram;
  const isQuiz=!!step.quiz;
  const isExam=!!step.exam;
  const stage=el('stage');
  if(!d && !isQuiz && !isExam){ stage.style.display='none'; return; }
  stage.style.display='';
  const canvas=el('canvas');
  canvas.style.height=''; canvas.style.minWidth='';
  el('stageTitle').innerHTML= isExam
    ? `${step.emoji} Evaluación final · sin feedback hasta entregar`
    : `${step.emoji||'📊'} ${escapeHtml((d&&d.note)||(isQuiz?'Pon a prueba lo aprendido':'Diagrama'))}`;
  if(isExam){ renderExam(step); return; }
  if(isQuiz){ renderQuiz(step); return; }
  if(d.type==='dataset') renderDataset(d);
  else if(d.type==='journey') renderJourney(d);
  else if(d.type==='growth') renderGrowth(d);
  else if(d.type==='schema') renderSchema(d);
}

/* ---------- render: reto rápido ---------- */
function renderReto(s){
  const box=el('reto');
  if(!s.reto){ box.style.display='none'; return; }
  box.style.display='';
  const r=s.reto;
  const ans=state.reto[s.id];
  box.innerHTML=`<div class="reto-head">🧩 Reto rápido · <span>piensa antes de mirar</span></div>
    <div class="reto-q">${escapeHtml(r.q)}</div>
    <div class="r-opts"></div>
    <div class="r-feed">${escapeHtml(r.explain)}</div>`;
  const optsBox=box.querySelector('.r-opts');
  (r.opts||[]).forEach((op,i)=>{
    const b=document.createElement('button');
    b.className='r-opt'+(ans!=null&&i===r.ok?' good':'');
    b.textContent=op;
    b.disabled=ans!=null;
    if(ans!=null&&i===ans&&i!==r.ok) b.classList.add('bad');
    b.addEventListener('click',()=>{
      state.reto[s.id]=i;
      saveProgress();
      renderReto(s);
    });
    optsBox.appendChild(b);
  });
  if(ans!=null){ box.classList.add('solved'); box.querySelector('.r-feed').style.display='block'; }
  else box.classList.remove('solved');
}

/* ---------- render: bitácora del ejercicio ---------- */
function renderExplain(s){
  const box=el('explain');
  const items=chatFor(s);
  if(!items.length || state.repaso){ box.style.display='none'; return; }
  box.style.display='';
  let html='<details class="explain-box"><summary>📖 Desarrollo del ejercicio · paso a paso</summary><div class="conversation">';
  items.forEach(it=>{
    const role=it.speaker==='you'?'you':'ai';
    const tag=role==='you'?'📝 Planteamiento':'📘 Aplicación de la norma';
    html+=`<div class="bubble ${role}"><span class="bubble-role">${tag}</span>${it.text}</div>`;
  });
  html+='</div></details>';
  box.innerHTML=html;
}

/* ---------- render: nubes de contexto ---------- */
function renderClouds(step){
  const box=el('clouds');
  box.innerHTML='';
  const list=step.clouds||[];
  if(list.length){
    const label=document.createElement('div');
    label.className='clouds-label';
    label.innerHTML=`🧭 Contextos clave · <span>clic en cada tarjeta para desplegar</span>`;
    box.appendChild(label);
  }
  list.forEach((cid,i)=>{
    const c=CONCEPTS[cid]; if(!c) return;
    const div=document.createElement('div');
    div.className='cloud';
    div.style.setProperty('--c',c.color);
    div.style.setProperty('--d',(i*0.7)+'s');
    div.dataset.cid=cid;
    div.tabIndex=0;
    div.setAttribute('role','button');
    div.setAttribute('aria-expanded','false');
    const toggle=()=>{
      const open=div.classList.toggle('open');
      div.setAttribute('aria-expanded',open?'true':'false');
    };
    div.innerHTML=`<div class="ct"><span class="ic">${c.ic}</span>${escapeHtml(c.label)}</div>
      <div class="cd">${escapeHtml(c.desc)}</div>
      <button class="g-open" title="Ver en el glosario" aria-label="Ver ${escapeHtml(c.label)} en el glosario">📖</button>
      <div class="hint">clic para ver detalle ↩</div>`;
    div.addEventListener('click',toggle);
    div.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }
    });
    const g=div.querySelector('.g-open');
    g.addEventListener('click',e=>{ e.stopPropagation(); openReference('gloss', cid); });
    box.appendChild(div);
  });
}

/* ---------- render: paso completo ---------- */
function phaseOf(step){ return PHASES[step.phase]; }

function renderStep(){
  const s=STEPS[state.cur];
  const ph=phaseOf(s);
  const total=STEPS.length;

  // acento de la fase en toda la interfaz
  document.documentElement.style.setProperty('--phase', ph.color);
  document.documentElement.style.setProperty('--phase-icon', '"'+ph.icon+'"');

  el('stepBadge').textContent=`${ph.icon} Fase · ${ph.label}  ·  Paso ${state.cur+1} de ${total}`;
  el('stepBadge').style.color=ph.color;
  el('stepBadge').style.borderColor=ph.color+'55';
  el('stepTitle').textContent=s.title;
  el('stepSubtitle').textContent=s.subtitle;

  // reto y explicación
  renderReto(s);
  renderExplain(s);

  // diagrama
  renderDiagram(s);

  // nubes
  renderClouds(s);

  // takeaway
  const tw=el('takeaway');
  if(s.takeaway){ tw.style.display=''; tw.innerHTML=`<b>💡 Para llevar</b>${escapeHtml(s.takeaway)}`; }
  else tw.style.display='none';

  applyRepasoUI();

  // animación de entrada de las secciones
  el('main').querySelectorAll('.anim-in').forEach((n,i)=>{
    n.style.animation='none'; void n.offsetWidth;
    n.style.animation=`fadeUp .5s ${(i*0.06).toFixed(2)}s cubic-bezier(.2,.7,.3,1) both`;
  });

  // barra de progreso
  el('progressBar').style.width=`${((state.cur+1)/total)*100}%`;

  // pipeline de fases
  renderPipeline(ph);

  // sidebar
  renderSidebar();

  // pager
  el('prevBtn').disabled = state.cur===0;
  el('nextBtn').textContent = state.cur===total-1 ? 'Reiniciar 🔁' : 'Siguiente →';

  // contador del visor MER
  const merN=merFor(state.cur).schema.tables.length;
  el('merBtn').textContent=`🗂 MER · ${merN} ${merN===1?'tabla':'tablas'}`;

  el('main').scrollTo({top:0, behavior:'auto'});
  el('sidebar').querySelector('.step-item.cur')?.scrollIntoView({block:'nearest'});
}

function renderPipeline(activePh){
  const box=el('pipeline');
  box.innerHTML='';
  Object.keys(PHASES).forEach(k=>{
    const ph=PHASES[k];
    const has=STEPS.find(s=>s.phase===k);
    const chip=document.createElement('div');
    chip.className='pip-chip'+(k===activePh?' on':'');
    chip.textContent=ph.label;
    chip.style.setProperty('--pc', ph.color);
    if(k===activePh){ chip.style.background=ph.color; chip.style.color='#07121f'; chip.style.boxShadow=`0 0 16px -4px ${ph.color}`; }
    chip.title=ph.label;
    chip.addEventListener('click',()=>{
      const idx=STEPS.findIndex(s=>s.phase===k);
      if(idx>=0) goto(idx);
    });
    box.appendChild(chip);
  });
}

function renderSidebar(){
  const sb=el('sidebar');
  sb.innerHTML='';
  const cur=STEPS[state.cur];
  let lastPh=null, html='';
  STEPS.forEach((s,i)=>{
    const ph=phaseOf(s);
    if(ph!==lastPh){
      html+=`<div class="phase-group"><div class="phase-head" style="color:${ph.color}"><span class="dot" style="background:${ph.color};box-shadow:0 0 8px ${ph.color}"></span>${ph.icon} ${ph.label}</div>`;
      lastPh=ph;
    }
    const st = i<state.cur?'done':(i===state.cur?'cur':'');
    html+=`<div class="step-item ${st}" data-i="${i}" style="--pc:${ph.color}">
      <span class="sq">${st==='done'?'✓':(i===state.cur?'●':s.emoji)}</span>
      <span class="step-txt">${escapeHtml(s.title)}<small>${s.subtitle.length>42?s.subtitle.slice(0,42)+'…':s.subtitle}</small></span>
    </div>`;
    if(i===STEPS.length-1 || STEPS[i+1].phase!==s.phase) html+='</div>';
  });
  sb.innerHTML=html;
  sb.querySelectorAll('.step-item').forEach(item=>{
    item.addEventListener('click',()=>goto(+item.dataset.i));
  });
}

/* ---------- panel de referencia ---------- */
let lastFocused=null;
function openReference(tab, focusCid){
  if(tab) refState.tab=tab;
  refState.focus=focusCid||null;
  lastFocused=document.activeElement;
  el('refModal').hidden=false;
  el('refModal').setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  renderReference();
  el('refClose').focus();
  if(refState.focus){
    requestAnimationFrame(()=>{
      const card=el('refBody').querySelector(`.g-card[data-cid="${refState.focus}"]`);
      card?.scrollIntoView({block:'center', behavior:'smooth'});
      card?.classList.add('active');
    });
  }
}
function closeReference(){
  if(el('refModal').hidden) return;
  el('refModal').hidden=true;
  el('refModal').setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  refState.focus=null;
  if(lastFocused&&lastFocused.focus) lastFocused.focus();
  lastFocused=null;
}

/* ---------- visor MER evolutivo ---------- */
let merLastFocused=null;
function openMer(){
  const st=merFor(state.cur);
  const ph=phaseOf(STEPS[state.cur]);
  merLastFocused=document.activeElement;
  el('merTitle').innerHTML=`🗂 MER en este paso · <span class="mer-title-state">${escapeHtml(st.label)}</span>`;
  el('merCaption').innerHTML=`<span class="mer-pill">${ph.icon} ${escapeHtml(ph.label)}</span><b>${escapeHtml(st.label)}</b><span>${escapeHtml(st.desc)}</span>`;
  el('merModal').hidden=false;
  el('merModal').setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  el('merClose').focus();
  requestAnimationFrame(()=>renderSchema(st.schema, el('merCanvas')));
}
function closeMer(){
  if(el('merModal').hidden) return;
  el('merModal').hidden=true;
  el('merModal').setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  if(merLastFocused&&merLastFocused.focus) merLastFocused.focus();
  merLastFocused=null;
}
/* foco atrapado dentro del modal mientras está abierto */
document.addEventListener('keydown',e=>{
  const modal = !el('refModal').hidden ? el('refModal')
              : (!el('merModal').hidden ? el('merModal') : null);
  if(e.key!=='Tab'||!modal) return;
  const f=[...modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')]
    .filter(n=>n.offsetParent!==null);
  if(!f.length) return;
  const first=f[0], last=f[f.length-1];
  if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
});
function renderReference(){
  el('refBody').innerHTML='';
  el('refBody').dataset.tab=refState.tab;
  el('refModal').querySelectorAll('.tab').forEach(t=>{
    const on=t.dataset.tab===refState.tab;
    t.classList.toggle('on', on);
    t.setAttribute('aria-selected', on?'true':'false');
  });
  if(refState.tab==='cheat') renderTabCheat();
  else if(refState.tab==='gloss') renderTabGloss();
  else renderTabCards();
}
function renderTabCheat(){
  let html='<div class="cheat-rows">';
  CHEAT.forEach((c)=>{
    html+=`<div class="cheat-row">
      <div class="ch-fn">${c.fn}</div>
      <div class="ch-cell"><b>Requisitos</b>${escapeHtml(c.reqs)}</div>
      <div class="ch-cell"><b>Anomalía que evita</b>${escapeHtml(c.ano)}</div>
      <div class="ch-cell"><b>Ejemplo</b>${escapeHtml(c.ex)}</div>
    </div>`;
  });
  html+='</div>';
  el('refBody').innerHTML=html;
}
function renderTabGloss(){
  const box=el('refBody');
  box.innerHTML=`<label class="gsearch-label" for="glossQ">Buscar concepto</label>
    <input id="glossQ" class="gsearch" type="search" placeholder="Buscar concepto…" autocomplete="off">`;
  const grid=document.createElement('div');
  grid.className='g-grid';
  Object.keys(CONCEPTS).forEach(cid=>{
    const c=CONCEPTS[cid];
    const d=document.createElement('div');
    d.className='g-card';
    d.dataset.cid=cid;
    d.dataset.q=(c.label+' '+c.desc).toLowerCase();
    d.style.setProperty('--c',c.color);
    d.innerHTML=`<div class="g-t"><span class="g-ic">${c.ic}</span>${escapeHtml(c.label)}</div><div class="g-d">${escapeHtml(c.desc)}</div>`;
    grid.appendChild(d);
  });
  box.appendChild(grid);
  const input=box.querySelector('#glossQ');
  input.value=refState.q;
  input.focus();
  const applyFilter=()=>{
    const fq=refState.q.trim().toLowerCase();
    grid.querySelectorAll('.g-card').forEach(c=>{ c.style.display=(!fq||c.dataset.q.includes(fq))?'':'none'; });
  };
  applyFilter();
  input.addEventListener('input',()=>{ refState.q=input.value; applyFilter(); });
  if(refState.focus){
    const card=grid.querySelector(`.g-card[data-cid="${refState.focus}"]`);
    card?.classList.add('active');
  }
}
function renderTabCards(){
  const box=el('refBody');
  if(!refState.flash.order.length){
    refState.flash.order=Object.keys(CONCEPTS);
    refState.flash.i=0; refState.flash.flipped=false;
  }
  const cid=refState.flash.order[refState.flash.i];
  const c=CONCEPTS[cid];
  box.innerHTML=`
    <div class="card-deck">
      <div class="flash ${refState.flash.flipped?'flipped':''}" style="--c:${c.color}">
        <div class="flash-in">
          <div class="flash-front"><span class="g-ic">${c.ic}</span><div>${escapeHtml(c.label)}</div><small>clic para voltear</small></div>
          <div class="flash-back">${escapeHtml(c.desc)}</div>
        </div>
      </div>
    </div>
    <div class="card-controls">
      <button class="btn btn-sm" id="fshuff">🎲 Barajar</button>
      <button class="btn btn-sm" id="fprev">◀ Anterior</button>
      <span class="fcount">${refState.flash.i+1} / ${refState.flash.order.length}</span>
      <button class="btn btn-sm" id="fnext">Siguiente ▶</button>
    </div>`;
  box.querySelector('.flash').addEventListener('click',()=>{
    refState.flash.flipped=!refState.flash.flipped;
    box.querySelector('.flash').classList.toggle('flipped', refState.flash.flipped);
  });
  el('fshuff').addEventListener('click',()=>{
    const o=Object.keys(CONCEPTS).slice();
    for(let i=o.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [o[i],o[j]]=[o[j],o[i]]; }
    refState.flash.order=o; refState.flash.i=0; refState.flash.flipped=false;
    renderTabCards();
  });
  el('fprev').addEventListener('click',()=>{
    refState.flash.i=(refState.flash.i+refState.flash.order.length-1)%refState.flash.order.length;
    refState.flash.flipped=false; renderTabCards();
  });
  el('fnext').addEventListener('click',()=>{
    refState.flash.i=(refState.flash.i+1)%refState.flash.order.length;
    refState.flash.flipped=false; renderTabCards();
  });
}

/* ---------- modo repaso ---------- */
function applyRepasoUI(){
  const on=state.repaso;
  document.body.classList.toggle('repaso', on);
  el('repasoBtn').classList.toggle('on', on);
  const n=failedSteps().length;
  el('repasoBtn').textContent= on ? `🎯 Repaso (${n})` : '🎯 Repaso';
  el('repasoBtn').title= on
    ? (n? `Repasando solo los ${n} pasos con fallos` : 'Sin fallos pendientes: navegación libre')
    : 'Repetir solo los pasos con fallos';
  if(el('explain')) el('explain').style.display= on ? 'none' : '';
}
/* pasos con algún reto o quiz respondido mal */
function failedSteps(){
  const out=[];
  STEPS.forEach((s,i)=>{
    if(s.exam) return;
    if(s.reto && state.reto[s.id]!=null && state.reto[s.id]!==s.reto.ok){ out.push(i); return; }
    if(s.quiz && s.quiz.some((qq,qi)=>{
      const a=state.quiz[s.id+':'+qi];
      return a!=null && a!==qq.ok;
    })) out.push(i);
  });
  return out;
}

/* ---------- navegación ---------- */
function repasoOrder(){
  if(!state.repaso) return null;
  const fails=failedSteps();
  return fails.length? fails : null;
}
function goto(i){
  if(i<0||i>=STEPS.length) return;
  state.cur=i;
  state.lastSeen=STEPS[i].id;
  saveProgress();
  try{ if(history.replaceState) history.replaceState(null,'','#'+STEPS[i].id); }catch(e){}
  renderStep();
}
function stepFromHash(){
  const h=location.hash.replace('#','');
  if(!h) return null;
  const idx=STEPS.findIndex(s=>s.id===h);
  if(idx>=0) return idx;
  const num=parseInt(h,10);
  if(!isNaN(num)&&num>=1&&num<=STEPS.length) return num-1;
  return null;
}
window.addEventListener('hashchange',()=>{
  const idx=stepFromHash();
  if(idx!==null&&idx!==state.cur){ state.cur=idx; renderStep(); }
});
function next(){
  const order=repasoOrder();
  if(order){
    const pos=order.indexOf(state.cur);
    if(pos>=0&&pos<order.length-1) goto(order[pos+1]);
    else if(pos<0) goto(order[0]);
    return;
  }
  if(state.cur<STEPS.length-1) goto(state.cur+1);
}
function prev(){
  const order=repasoOrder();
  if(order){
    const pos=order.indexOf(state.cur);
    if(pos>0) goto(order[pos-1]);
    else if(pos<0) goto(order[order.length-1]);
    return;
  }
  if(state.cur>0) goto(state.cur-1);
}

/* ---------- persistencia ---------- */
const STORE_KEY='normApp_v1';
function saveProgress(){
  try{
    localStorage.setItem(STORE_KEY, JSON.stringify({
      reto:state.reto,
      quiz:state.quiz,
      exam:state.exam,
      repaso:state.repaso, lastSeen:state.lastSeen, refTab:refState.tab
    }));
  }catch(e){}
  applyRepasoUI();
}
function loadProgress(){
  try{
    const raw=localStorage.getItem(STORE_KEY);
    if(!raw) return;
    const d=JSON.parse(raw);
    if(d.reto) state.reto=d.reto;
    if(d.quiz) state.quiz=d.quiz;
    if(d.exam) state.exam=d.exam;
    if('repaso' in d) state.repaso=!!d.repaso;
    if(d.lastSeen) state.lastSeen=d.lastSeen;
    if(d.refTab) refState.tab=d.refTab;
  }catch(e){}
}

/* ---------- pequeños helpers ---------- */
function escapeHtml(s){
  const el2=document.createElement('div');
  el2.textContent=s==null?'':String(s);
  return el2.innerHTML;
}

/* ---------- parallax de las nubes ---------- */
(function initParallax(){
  document.addEventListener('mousemove',e=>{
    const cx=(e.clientX/innerWidth-0.5), cy=(e.clientY/innerHeight-0.5);
    const c=el('clouds');
    if(c) c.style.transform=`translate(${cx*-10}px, ${cy*-6}px)`;
  });
})();

/* ---------- teclado ---------- */
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
  const refOpen=!el('refModal').hidden;
  const merOpen=!el('merModal').hidden;
  if(e.key==='Escape'){ if(refOpen) closeReference(); else if(merOpen) closeMer(); return; }
  if(refOpen||merOpen) return;
  if(e.key==='ArrowRight') next();
  else if(e.key==='ArrowLeft') prev();
});

/* ---------- inicializar ---------- */
el('prevBtn').addEventListener('click',prev);
el('nextBtn').addEventListener('click',()=>{
  if(state.cur===STEPS.length-1) goto(0);
  else next();
});
el('brand').addEventListener('click',()=>goto(0));
el('refBtn').addEventListener('click',()=>openReference());
el('refClose').addEventListener('click',closeReference);
el('refModal').addEventListener('click',e=>{ if(e.target.id==='refModal') closeReference(); });
el('refModal').querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>openReference(t.dataset.tab)));
el('merBtn').addEventListener('click',openMer);
el('merClose').addEventListener('click',closeMer);
el('merModal').addEventListener('click',e=>{ if(e.target.id==='merModal') closeMer(); });
el('repasoBtn').addEventListener('click',()=>{
  state.repaso=!state.repaso;
  saveProgress();
  applyRepasoUI();
  renderSidebar();
  if(state.repaso){
    const f=failedSteps();
    if(f.length && !f.includes(state.cur)) goto(f[0]);
  }
});
loadProgress();
const hIdx=stepFromHash();
let startIdx=hIdx;
if(startIdx===null && state.lastSeen){
  const li=STEPS.findIndex(s=>s.id===state.lastSeen);
  if(li>=0) startIdx=li;
}
state.cur = startIdx!==null ? startIdx : 0;
applyRepasoUI();
renderStep();
const rm=(location.hash.match(/ref=([a-z]+)/)||[])[1];
if(rm==='cheat'||rm==='gloss'||rm==='cards') openReference(rm);