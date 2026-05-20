import { ExpenseCategory, ExpenseSubcategory } from '../types';

export const expenseCategories: ExpenseCategory[] = [
  { id: 'VS', name: 'Vivienda y Servicios', icon: '🏠' },
  { id: 'AB', name: 'Alimentos y Bebidas', icon: '🍽️' },
  { id: 'TR', name: 'Transporte', icon: '🚗' },
  { id: 'SB', name: 'Salud y Bienestar', icon: '💊' },
  { id: 'EF', name: 'Educación y Familia', icon: '👨‍👩‍👧‍👦' },
  { id: 'TD', name: 'Tecnología', icon: '💻' },
  { id: 'FL', name: 'Financiero y Legal', icon: '💰' },
];

export const expenseSubcategories: ExpenseSubcategory[] = [
  { id: 'VS1', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Renta / Hipoteca', examples: ['Pago mensual casa', 'Renta depa'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'VS2-1', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Luz', examples: ['Luz'], frequency: 'Bimestral', type: 'Esencial' },
  { id: 'VS2-2', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Agua', examples: ['Agua'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'VS2-3', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Gas', examples: ['Gas'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'VS2-4', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Otros Servicios', examples: ['Basura', 'Vigilancia'], frequency: 'Variable', type: 'Esencial' },
  { id: 'VS3-1', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Plomería', examples: ['Plomería'], frequency: 'Irregular', type: 'Esencial' },
  { id: 'VS3-2', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Electricidad / Reparaciones', examples: ['Electricidad', 'Reparaciones'], frequency: 'Irregular', type: 'Esencial' },
  { id: 'VS3-3', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Jardinería / Limpieza', examples: ['Jardinería', 'Limpieza'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'VS3-4', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Muebles y Decoración', examples: ['Muebles', 'Decoración'], frequency: 'Irregular', type: 'Deseo' },
  { id: 'VS3-5', mainCategoryId: 'VS', mainCategory: 'Vivienda y Servicios', subcategory: 'Otros Mantenimiento', examples: ['Otros Mantenimiento'], frequency: 'Irregular', type: 'Variable' },

  { id: 'AB1-1', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Despensa', examples: ['Despensa', 'Supermercado'], frequency: 'Semanal', type: 'Esencial' },
  { id: 'AB1-2', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Otros Mercado', examples: ['Carnicería', 'Frutería', 'Mercado'], frequency: 'Semanal', type: 'Esencial' },
  { id: 'AB1-3', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Agua Purificada', examples: ['Garrafón'], frequency: 'Semanal', type: 'Esencial' },
  { id: 'AB2-1', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Tienda / Oxxo', examples: ['Oxxo', '7-Eleven', 'Tiendita'], frequency: 'Diario', type: 'Deseo' },
  { id: 'AB2-2', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Café / Panadería', examples: ['Café', 'Panadería', 'Antojitos'], frequency: 'Diario', type: 'Deseo' },
  { id: 'AB2-3', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Otros Comida Rápida', examples: ['Otros Comida Rápida'], frequency: 'Variable', type: 'Deseo' },
  { id: 'AB3-1', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Restaurantes', examples: ['Restaurante', 'Sushi', 'Tacos', 'Pizza'], frequency: 'Semanal', type: 'Deseo' },
  { id: 'AB3-2', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Apps Delivery', examples: ['Apps Delivery'], frequency: 'Variable', type: 'Deseo' },
  { id: 'AB3-3', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Bares / Alcohol', examples: ['Bares', 'Alcohol'], frequency: 'Semanal', type: 'Deseo' },
  { id: 'AB3-4', mainCategoryId: 'AB', mainCategory: 'Alimentos y Bebidas', subcategory: 'Otros Restaurantes', examples: ['Otros Restaurantes'], frequency: 'Variable', type: 'Deseo' },

  { id: 'TR1-1', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Gasolina / Combustible', examples: ['Gasolina', 'Combustible'], frequency: 'Semanal', type: 'Esencial' },
  { id: 'TR1-2', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Autolavado', examples: ['Autolavado', 'Estética Auto'], frequency: 'Mensual', type: 'Deseo' },
  { id: 'TR1-3', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Accesorios Auto', examples: ['Accesorios Auto'], frequency: 'Variable', type: 'Deseo' },
  { id: 'TR1-4', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Otros Automóvil', examples: ['Otros Automóvil'], frequency: 'Variable', type: 'Variable' },
  { id: 'TR2-1', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Servicio Mecánico', examples: ['Aceite', 'Motor'], frequency: 'Semestral', type: 'Esencial' },
  { id: 'TR2-2', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Llantas / Suspensión', examples: ['Llantas', 'Suspensión'], frequency: 'Anual', type: 'Esencial' },
  { id: 'TR2-3', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Hojalatería y Pintura', examples: ['Hojalatería', 'Pintura'], frequency: 'Irregular', type: 'Variable' },
  { id: 'TR2-4', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Otros Mantenimiento Auto', examples: ['Otros Mantenimiento Auto'], frequency: 'Irregular', type: 'Variable' },
  { id: 'TR3-1', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Apps de Transporte', examples: ['Uber', 'Didi', 'Cabify'], frequency: 'Variable', type: 'Esencial' },
  { id: 'TR3-2', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Transporte Público', examples: ['Taxi', 'Camión', 'Metro', 'Colectivo'], frequency: 'Diario', type: 'Esencial' },
  { id: 'TR3-3', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Otros Transporte', examples: ['Otros Transporte'], frequency: 'Variable', type: 'Esencial' },
  { id: 'TR4-1', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Estacionamiento', examples: ['Estacionamiento', 'Parquímetro'], frequency: 'Variable', type: 'Esencial' },
  { id: 'TR4-2', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Peajes / Casetas', examples: ['Peajes', 'Casetas'], frequency: 'Variable', type: 'Variable' },
  { id: 'TR4-3', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Seguro de Auto', examples: ['Seguro de Auto'], frequency: 'Anual', type: 'Esencial' },
  { id: 'TR4-4', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Tenencia / Verificación', examples: ['Tenencia', 'Verificación', 'Licencia'], frequency: 'Anual', type: 'Obligatorio' },
  { id: 'TR4-5', mainCategoryId: 'TR', mainCategory: 'Transporte', subcategory: 'Otros Trámites Auto', examples: ['Otros Trámites Auto'], frequency: 'Variable', type: 'Obligatorio' },

  { id: 'SB1-1', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Consulta Médica', examples: ['Consulta General', 'Especialista'], frequency: 'Variable', type: 'Esencial' },
  { id: 'SB1-2', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Dentista', examples: ['Dentista', 'Ortodoncia'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'SB1-3', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Terapia', examples: ['Psicólogo', 'Psiquiatra'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'SB1-4', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Laboratorio', examples: ['Estudios', 'Análisis'], frequency: 'Variable', type: 'Esencial' },
  { id: 'SB1-5', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Otros Salud', examples: ['Otros Salud'], frequency: 'Variable', type: 'Esencial' },
  { id: 'SB2-1', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Medicamentos', examples: ['Medicamentos'], frequency: 'Variable', type: 'Esencial' },
  { id: 'SB2-2', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Vitaminas / Suplementos', examples: ['Vitaminas', 'Suplementos'], frequency: 'Mensual', type: 'Deseo' },
  { id: 'SB2-3', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Otros Farmacia', examples: ['Otros Farmacia'], frequency: 'Variable', type: 'Variable' },
  { id: 'SB3-1', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Barbería / Estética', examples: ['Barbería', 'Estética', 'Salón'], frequency: 'Mensual', type: 'Deseo' },
  { id: 'SB3-2', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Cosméticos / Higiene', examples: ['Cosméticos', 'Higiene'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'SB3-3', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Lentes / Óptica', examples: ['Lentes', 'Óptica'], frequency: 'Anual', type: 'Esencial' },
  { id: 'SB3-4', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Gimnasio / Deportes', examples: ['Gimnasio', 'Deportes'], frequency: 'Mensual', type: 'Deseo' },
  { id: 'SB3-5', mainCategoryId: 'SB', mainCategory: 'Salud y Bienestar', subcategory: 'Otros Cuidado Personal', examples: ['Otros Cuidado Personal'], frequency: 'Variable', type: 'Deseo' },

  { id: 'EF1-1', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Colegiatura', examples: ['Colegiatura', 'Mensualidad Escolar'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'EF1-2', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Inscripción', examples: ['Inscripción', 'Reinscripción'], frequency: 'Semestral', type: 'Esencial' },
  { id: 'EF1-3', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Cursos Extra', examples: ['Cursos', 'Idiomas'], frequency: 'Mensual', type: 'Deseo' },
  { id: 'EF1-4', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Otros Educación', examples: ['Otros Educación'], frequency: 'Variable', type: 'Variable' },
  { id: 'EF2-1', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Útiles Escolares', examples: ['Útiles', 'Libros'], frequency: 'Anual', type: 'Esencial' },
  { id: 'EF2-2', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Uniformes / Ropa Hijos', examples: ['Uniformes', 'Ropa Hijos'], frequency: 'Semestral', type: 'Esencial' },
  { id: 'EF2-3', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Juguetes / Actividades', examples: ['Juguetes', 'Actividades'], frequency: 'Variable', type: 'Deseo' },
  { id: 'EF2-4', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Otros Gastos Hijos', examples: ['Otros Gastos Hijos'], frequency: 'Variable', type: 'Variable' },
  { id: 'EF3-1', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Alimento Mascota', examples: ['Alimento Mascota'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'EF3-2', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Veterinario / Vacunas', examples: ['Veterinario', 'Vacunas'], frequency: 'Anual', type: 'Esencial' },
  { id: 'EF3-3', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Accesorios Mascota', examples: ['Arena', 'Juguetes'], frequency: 'Mensual', type: 'Variable' },
  { id: 'EF3-4', mainCategoryId: 'EF', mainCategory: 'Educación y Familia', subcategory: 'Otros Mascotas', examples: ['Otros Mascotas'], frequency: 'Variable', type: 'Variable' },

  { id: 'TD1-1', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Internet Hogar', examples: ['TotalPlay', 'Infinitum'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'TD1-2', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Plan Celular', examples: ['AT&T', 'Telcel', 'Recargas'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'TD1-3', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Software / Nube', examples: ['Google', 'Apple'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'TD1-4', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Streaming', examples: ['Netflix', 'Spotify', 'Prime'], frequency: 'Mensual', type: 'Deseo' },
  { id: 'TD1-5', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Otros Servicios Digitales', examples: ['Otros Servicios Digitales'], frequency: 'Variable', type: 'Variable' },
  { id: 'TD2-1', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Computadora / Tablet', examples: ['Computadora', 'Tablet'], frequency: 'Irregular', type: 'Variable' },
  { id: 'TD2-2', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Celular', examples: ['Celular'], frequency: 'Irregular', type: 'Variable' },
  { id: 'TD2-3', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Accesorios Electrónicos', examples: ['Accesorios Electrónicos'], frequency: 'Variable', type: 'Deseo' },
  { id: 'TD2-4', mainCategoryId: 'TD', mainCategory: 'Tecnología', subcategory: 'Otros Tecnología', examples: ['Otros Tecnología'], frequency: 'Variable', type: 'Deseo' },

  { id: 'FL1-1', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Tarjeta de Crédito', examples: ['Pago Tarjeta de Crédito'], frequency: 'Mensual', type: 'Obligatorio' },
  { id: 'FL1-2', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Préstamo / Hipoteca', examples: ['Pago Préstamo', 'Hipoteca'], frequency: 'Mensual', type: 'Obligatorio' },
  { id: 'FL1-3', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Comisiones Bancarias', examples: ['Comisiones Bancarias'], frequency: 'Variable', type: 'Obligatorio' },
  { id: 'FL1-4', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Otros Financieros', examples: ['Otros Financieros'], frequency: 'Variable', type: 'Obligatorio' },
  { id: 'FL2-1', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'SAT / Impuestos', examples: ['SAT', 'Impuestos'], frequency: 'Anual', type: 'Obligatorio' },
  { id: 'FL2-2', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Predial', examples: ['Predial'], frequency: 'Anual', type: 'Obligatorio' },
  { id: 'FL2-3', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Trámites Gubernamentales', examples: ['Trámites Gubernamentales'], frequency: 'Variable', type: 'Obligatorio' },
  { id: 'FL2-4', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Otros Legal', examples: ['Otros Legal'], frequency: 'Variable', type: 'Obligatorio' },
  { id: 'FL3-1', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Seguro Gastos Médicos', examples: ['Seguro Gastos Médicos'], frequency: 'Anual', type: 'Esencial' },
  { id: 'FL3-2', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Seguro de Vida', examples: ['Seguro de Vida'], frequency: 'Anual', type: 'Esencial' },
  { id: 'FL3-3', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Ahorro / Inversión', examples: ['Ahorro', 'Inversión'], frequency: 'Mensual', type: 'Esencial' },
  { id: 'FL3-4', mainCategoryId: 'FL', mainCategory: 'Financiero y Legal', subcategory: 'Otros Seguros', examples: ['Otros Seguros'], frequency: 'Variable', type: 'Esencial' },
];

export const getCategoryById = (id: string): ExpenseCategory | undefined => {
  return expenseCategories.find(category => category.id === id);
};

export const getSubcategoryById = (id: string): ExpenseSubcategory | undefined => {
  return expenseSubcategories.find(subcategory => subcategory.id === id);
};

export const getSubcategoriesByMainCategory = (mainCategoryId: string): ExpenseSubcategory[] => {
  return expenseSubcategories.filter(subcategory => subcategory.mainCategoryId === mainCategoryId);
};

export const searchSubcategories = (query: string): ExpenseSubcategory[] => {
  const lowerQuery = query.toLowerCase();
  return expenseSubcategories.filter(subcategory =>
    subcategory.subcategory.toLowerCase().includes(lowerQuery) ||
    subcategory.examples.some(example => example.toLowerCase().includes(lowerQuery)) ||
    subcategory.mainCategory.toLowerCase().includes(lowerQuery)
  );
};