import React from 'react';
import { ArrowLeft, FileText, AlertTriangle, Scale, Shield, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf3e5] via-[#fef7ed] to-[#bed4cf]/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#728c6a] hover:text-[#5a7054] transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#bed4cf]/20">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="p-3 bg-[#728c6a]/10 rounded-xl">
              <FileText className="w-8 h-8 text-[#728c6a]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#728c6a]">Términos y Condiciones de Uso</h1>
              <p className="text-sm text-gray-600 mt-1">Última actualización: 6 de enero de 2026</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                1. Aceptación de los Términos
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Bienvenido a "Mi Chivito". Al descargar, instalar o utilizar esta aplicación móvil (en adelante, la "App"),
                usted (en adelante, el "Usuario") acepta estar legalmente vinculado por los presentes Términos y Condiciones.
                Si no está de acuerdo con alguno de estos términos, le rogamos no utilizar la App.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Estos términos constituyen un acuerdo legal vinculante entre el Usuario y <strong>MiChivio S.A De C.V</strong> (en
                adelante, el "Titular"), con domicilio en Tijuana, Baja California, México.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                2. Descripción del Servicio y Licencia
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                "Mi Chivito" es una herramienta de gestión de finanzas personales diseñada para ayudar al Usuario a registrar
                ingresos, gastos y metas de ahorro.
              </p>
              <p className="text-gray-700 leading-relaxed">
                El Titular otorga al Usuario una licencia <strong>limitada, no exclusiva, intransferible y revocable</strong> para
                utilizar la App exclusivamente para fines personales y no comerciales, sujeta al cumplimiento de estos Términos.
              </p>
            </section>

            <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                3. EXENCIÓN DE RESPONSABILIDAD FINANCIERA (DISCLAIMER)
              </h2>
              <p className="text-red-900 font-semibold mb-4 uppercase text-sm">
                LEA ESTA SECCIÓN CUIDADOSAMENTE:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Carácter Informativo:</h3>
                  <p className="text-gray-800 leading-relaxed">
                    La información, cálculos, gráficas y consejos proporcionados por la App tienen fines meramente informativos
                    y educativos. <strong>NO constituyen asesoramiento financiero, de inversión, fiscal o legal profesional.</strong>
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">No Vinculación:</h3>
                  <p className="text-gray-800 leading-relaxed">
                    "Mi Chivito" no garantiza resultados específicos (como salir de deudas o enriquecerse). Las decisiones
                    financieras tomadas por el Usuario son de su exclusiva responsabilidad.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Liberación de Responsabilidad:</h3>
                  <p className="text-gray-800 leading-relaxed">
                    El Titular no será responsable por pérdidas económicas, daños patrimoniales o perjuicios que el Usuario
                    pudiera sufrir derivados de decisiones tomadas basándose en la información de la App. Se recomienda al
                    Usuario consultar con un asesor financiero certificado antes de tomar decisiones de inversión de alto riesgo.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">4. Servicios de Terceros y Publicidad (Modelo de Leads)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                La App puede mostrar enlaces, recomendaciones o publicidad de productos financieros de terceros (por ejemplo,
                agentes de seguros o planes de ahorro).
              </p>

              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Intermediación:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    El Usuario reconoce que "Mi Chivito" actúa únicamente como un canal de comunicación o referencia.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Relación Contractual:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Si el Usuario decide contratar un producto sugerido (ej. un Seguro de Vida), dicha relación contractual
                    será exclusivamente entre el Usuario y la Institución Financiera o Agente de Seguros. "Mi Chivito" no es
                    parte de dicho contrato ni responsable del cumplimiento del mismo.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Enlaces Externos:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    La App no controla ni garantiza la exactitud de la información en sitios web de terceros enlazados desde la App.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">5. Cuentas y Seguridad</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
                </li>
                <li>
                  El Usuario acepta notificar inmediatamente al Titular cualquier uso no autorizado de su cuenta.
                </li>
                <li>
                  "Mi Chivito" no se hace responsable de pérdidas derivadas del robo de identidad o acceso no autorizado
                  imputable al descuido del Usuario.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">6. Propiedad Intelectual</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Todos los derechos de propiedad intelectual sobre el software, diseño, código fuente, logotipos ("Mi Chivito")
                y contenido de la App son propiedad exclusiva del Titular o de sus licenciantes, protegidos por la{' '}
                <strong>Ley Federal de Protección a la Propiedad Industrial</strong> y la{' '}
                <strong>Ley Federal del Derecho de Autor</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Queda prohibida la ingeniería inversa, descompilación o copia de la App.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">7. Disponibilidad y Errores</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                El Titular no garantiza que la App funcione ininterrumpidamente o libre de errores. El servicio se proporciona{' '}
                <strong>"tal cual" (as-is)</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Nos reservamos el derecho de interrumpir el servicio temporalmente por mantenimiento o permanentemente sin
                previo aviso, sin que esto genere derecho a indemnización alguna.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">8. Modificaciones a los Términos</h2>
              <p className="text-gray-700 leading-relaxed">
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en
                vigor al momento de su publicación en la App. El uso continuado de la App constituirá la aceptación de dichas
                modificaciones.
              </p>
            </section>

            <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Scale className="w-6 h-6" />
                9. Legislación Aplicable y Jurisdicción
              </h2>
              <p className="text-gray-800 leading-relaxed mb-3">
                Para la interpretación y cumplimiento de los presentes Términos, las partes se someten a las leyes vigentes
                en los <strong>Estados Unidos Mexicanos</strong>.
              </p>
              <p className="text-gray-800 leading-relaxed">
                Para cualquier controversia, las partes renuncian expresamente a cualquier otro fuero que pudiera
                corresponderles por razón de sus domicilios presentes o futuros y se someten a la jurisdicción de los
                Tribunales competentes en la ciudad de <strong>Tijuana, Baja California</strong>.
              </p>
            </section>

            <section className="border-t border-gray-200 pt-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-[#728c6a] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contacto</h3>
                    <p className="text-gray-700 mb-2">
                      Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos en:
                    </p>
                    <p className="text-gray-900 font-medium">
                      <a href="mailto:info@mi-chivito.com" className="text-blue-600 hover:underline">
                        info@mi-chivito.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
