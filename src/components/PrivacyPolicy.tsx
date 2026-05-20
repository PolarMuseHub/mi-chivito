import React from 'react';
import { ArrowLeft, Shield, Mail, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
              <Shield className="w-8 h-8 text-[#728c6a]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#728c6a]">Aviso de Privacidad Integral</h1>
              <p className="text-sm text-gray-600 mt-1">Última actualización: 6 de enero de 2026</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                1. Identidad y Domicilio del Responsable
              </h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>Michivito S.A de C.V</strong> (en adelante "Mi Chivito"), con domicilio para oír y recibir
                notificaciones en Calle Central 123, Colonia mi colonia, Tijuana, B.C México, es el responsable del
                uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                2. Datos Personales que recabamos
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Para brindarle las funcionalidades de la aplicación, recabaremos las siguientes categorías de datos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Datos de Identificación:</strong> Nombre completo, correo electrónico, número de teléfono celular.
                </li>
                <li>
                  <strong>Datos Patrimoniales y Financieros:</strong> Información sobre sus ingresos, gastos, deudas,
                  metas de ahorro y fechas de pago.
                </li>
                <li>
                  <strong>Datos Técnicos y de Dispositivo:</strong> Dirección IP, ID del dispositivo, datos de uso de
                  la aplicación, registros de fallos (crash logs) y tipo de sistema operativo.
                </li>
              </ul>
              <p className="text-gray-600 text-sm mt-2 italic">
                Nota: Estos datos son esenciales para que la app funcione (generar gráficas, presupuestos, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">3. ¿Para qué fines utilizaremos sus datos personales?</h2>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">A. Finalidades Primarias (Necesarias para el servicio)</h3>
                <p className="text-gray-700 mb-2">
                  Los datos que recabamos son necesarios para la existencia, mantenimiento y cumplimiento de la relación jurídica con usted:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Creación y gestión de su cuenta de usuario en "Mi Chivito".</li>
                  <li>Procesamiento y análisis de sus finanzas para mostrarle tableros de control, gráficas y presupuestos.</li>
                  <li>Respaldo de información en la nube para que pueda cambiar de dispositivo sin perder sus datos.</li>
                  <li>Atención al cliente y soporte técnico.</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">B. Finalidades Secundarias (Mercadotecnia y Leads)</h3>
                <p className="text-gray-700 mb-2">
                  De manera adicional, utilizaremos su información personal para finalidades que no son necesarias para
                  el servicio solicitado, pero que nos permiten y facilitan brindarle una mejor atención y acceso a productos financieros:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Envío de promociones y publicidad sobre educación financiera.</li>
                  <li>
                    <strong>Generación de oportunidades (Leads):</strong> Análisis de su perfil para recomendarle
                    productos de ahorro o seguros operados por terceros aliados estratégicos.
                  </li>
                  <li>Contactarlo vía telefónica o correo para ofrecerle dichos productos financieros personalizados.</li>
                </ul>
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Mecanismo de Negativa:</strong> En caso de que no desee que sus datos personales sean tratados
                    para estos fines secundarios, usted puede presentar desde este momento un escrito vía correo electrónico
                    a <a href="mailto:info@mi-chivito.com" className="text-blue-600 hover:underline">info@mi-chivito.com</a> manifestando
                    lo anterior. La negativa para el uso de sus datos para estas finalidades no será motivo para que le neguemos
                    los servicios de la aplicación.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">4. Transferencia de Datos Personales</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                Le informamos que sus datos personales podrán ser compartidos dentro y fuera del país con las siguientes
                personas, empresas, organizaciones y autoridades distintas a nosotros:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Proveedores de Servicios Tecnológicos:</strong> (Como Amazon Web Services, Google Firebase)
                  para el alojamiento y funcionamiento de la infraestructura de la App.
                </li>
                <li>
                  <strong>Aliados Comerciales (Sector Asegurador):</strong> Únicamente si usted muestra interés en un
                  producto específico o no ha manifestado su negativa, compartiremos sus datos de contacto con agentes
                  de seguros certificados para que le brinden asesoría personalizada.
                </li>
                <li>
                  <strong>Autoridades:</strong> En los casos legalmente previstos.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">5. Derechos ARCO y Eliminación de Cuenta</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las
                condiciones del uso que les damos (<strong>Acceso</strong>). Asimismo, es su derecho solicitar la
                corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta
                (<strong>Rectificación</strong>); que la eliminemos de nuestros registros o bases de datos cuando
                considere que la misma no está siendo utilizada adecuadamente (<strong>Cancelación</strong>); así como
                oponerse al uso de sus datos personales para fines específicos (<strong>Oposición</strong>).
              </p>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cómo borrar su cuenta (Requisito App Store / Google Play)</h3>
                <p className="text-gray-700 mb-2">
                  Para su comodidad, "Mi Chivito" permite la eliminación automatizada de su cuenta y datos asociados
                  directamente desde la aplicación:
                </p>
                <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                  <li>Ingrese al menú de "Configuración" o "Perfil".</li>
                  <li>Seleccione la opción "Eliminar Cuenta".</li>
                  <li>Confirme la acción.</li>
                </ol>
                <p className="text-sm text-red-600 font-medium mt-2">
                  Importante: Esta acción es irreversible y eliminará todo su historial financiero de nuestros servidores.
                </p>
              </div>

              <p className="text-gray-700 mt-3">
                Alternativamente, puede ejercer sus derechos ARCO enviando un correo a{' '}
                <a href="mailto:info@mi-chivito.com" className="text-blue-600 hover:underline font-medium">
                  info@mi-chivito.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">6. Uso de Tecnologías de Rastreo (Cookies y SDKs)</h2>
              <p className="text-gray-700 leading-relaxed">
                Le informamos que en nuestra aplicación utilizamos Software Development Kits (SDKs) y cookies de terceros
                (como Google Analytics y Firebase) que permiten monitorear su comportamiento como usuario de internet para
                brindarle un mejor servicio y experiencia de usuario al navegar en nuestra aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#728c6a] mb-3">7. Cambios al Aviso de Privacidad</h2>
              <p className="text-gray-700 leading-relaxed">
                El presente aviso de privacidad puede sufrir modificaciones derivadas de nuevos requerimientos legales o
                de nuestras propias necesidades. Nos comprometemos a mantenerlo informado sobre los cambios a través de
                una notificación dentro de la aplicación móvil o mediante un correo electrónico a la dirección registrada.
              </p>
            </section>

            <section className="border-t border-gray-200 pt-6 mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-[#728c6a] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Tienes preguntas?</h3>
                    <p className="text-gray-700 mb-2">
                      Si tiene alguna duda o pregunta sobre este aviso de privacidad, puede contactarnos en:
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

export default PrivacyPolicy;
