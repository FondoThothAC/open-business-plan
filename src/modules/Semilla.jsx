import { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, User, Lightbulb, Users, Trophy, Wrench, Megaphone, DollarSign, Heart, FileText, Image as ImageIcon } from 'lucide-react';
import PdfOcrReader from '../components/PdfOcrReader';
import LogoGeneratorModal from '../components/LogoGeneratorModal';

const BUSINESS_STEPS = [
  {
    id: 'emprendedor',
    title: 'El Emprendedor',
    icon: User,
    description: 'Cuéntanos sobre ti y tu experiencia.',
    fields: [
      { key: 'nombre_emprendedor', label: '¿Cuál es tu nombre completo?', placeholder: 'Ej: Roberto Eduardo Celis Robles' },
      { key: 'experiencia', label: '¿Cuál es tu experiencia profesional?', placeholder: 'Ej: 8 años en consultoría financiera, certificación AMIB, MBA en ITESM' },
      { key: 'motivacion', label: '¿Por qué quieres emprender este negocio?', placeholder: 'Ej: Detecté que el 68% de profesionistas en Sonora no tienen plan patrimonial' },
      { key: 'dedicacion', label: '¿Tiempo de dedicación disponible?', placeholder: 'Ej: Tiempo completo / Medio tiempo + empleo actual' }
    ]
  },
  {
    id: 'negocio',
    title: 'Tu Negocio',
    icon: Lightbulb,
    description: '¿Qué es y qué problema resuelve?',
    fields: [
      { key: 'que_es', label: '¿Qué es tu negocio en una oración?', placeholder: 'Ej: Consultoría patrimonial digital para profesionistas jóvenes' },
      { key: 'problema', label: '¿Qué problema específico resuelve?', placeholder: 'Ej: Falta de educación financiera y acceso a asesoría personalizada' },
      { key: 'producto_servicio', label: '¿Qué producto o servicio ofreces exactamente?', placeholder: 'Ej: Plan de inversión personalizado + seguimiento mensual + app de monitoreo', type: 'textarea' },
      { key: 'diferenciador', label: '¿Qué te hace diferente de la competencia?', placeholder: 'Ej: Sin comisiones ocultas, 100% digital, precio accesible desde $500/mes' }
    ]
  },
  {
    id: 'cliente',
    title: 'Tu Cliente Ideal',
    icon: Users,
    description: '¿A quién le vendes?',
    fields: [
      { key: 'cliente_edad', label: '¿Qué edad tiene tu cliente ideal?', placeholder: 'Ej: 28-45 años' },
      { key: 'cliente_genero', label: '¿Género predominante?', placeholder: 'Ej: Ambos / Mujeres profesionistas / Hombres empresarios' },
      { key: 'cliente_ubicacion', label: '¿Dónde está ubicado?', placeholder: 'Ej: Hermosillo, Sonora y ciudades del noroeste de México' },
      { key: 'cliente_ingreso', label: '¿Cuánto gana mensualmente?', placeholder: 'Ej: $20,000 - $50,000 MXN' },
      { key: 'cliente_dolor', label: '¿Cuál es su principal dolor o frustración?', placeholder: 'Ej: No sabe dónde invertir, le da miedo perder dinero, no confía en asesores tradicionales' }
    ]
  },
  {
    id: 'competencia',
    title: 'La Competencia',
    icon: Trophy,
    description: '¿Contra quién compites?',
    fields: [
      { key: 'competidores_directos', label: '¿Quiénes son tus competidores directos?', placeholder: 'Ej: GBM+, Actinver, asesores independientes de la zona', type: 'textarea' },
      { key: 'competidores_indirectos', label: '¿Competidores indirectos o sustitutos?', placeholder: 'Ej: YouTube financiero, apps como Fintual, cetes directo' },
      { key: 'ventaja_competitiva', label: '¿Tu ventaja competitiva principal?', placeholder: 'Ej: Atención personalizada + precio accesible + plataforma digital propia' }
    ]
  },
  {
    id: 'produccion',
    title: 'El Producto/Servicio',
    icon: Wrench,
    description: '¿Cómo lo produces o entregas?',
    fields: [
      { key: 'proceso_produccion', label: 'Describe tu proceso paso a paso', placeholder: 'Ej: 1) Cita diagnóstico 2) Diseño de portafolio 3) Presentación 4) Firma 5) Monitoreo mensual', type: 'textarea' },
      { key: 'capacidad', label: '¿Cuántos clientes/productos puedes atender al mes?', placeholder: 'Ej: 50 clientes/mes con 2 asesores' },
      { key: 'precio_estimado', label: '¿Cuál es tu precio estimado?', placeholder: 'Ej: Plan Básico $500/mes, Plan Pro $1,500/mes, Plan VIP $3,500/mes' }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing y Marca',
    icon: Megaphone,
    description: '¿Cómo te van a conocer?',
    fields: [
      { key: 'nombre_marca', label: '¿Cómo se llama tu marca/empresa?', placeholder: 'Ej: Jubilus Consultores' },
      { key: 'canales', label: '¿Cómo llegar a tus clientes?', placeholder: 'Ej: Instagram, LinkedIn, referidos, eventos de networking', type: 'textarea' },
      { key: 'presupuesto_mkt', label: '¿Cuánto puedes invertir en marketing al mes?', placeholder: 'Ej: $8,000 - $15,000 MXN' }
    ]
  },
  {
    id: 'finanzas',
    title: 'Dinero y Finanzas',
    icon: DollarSign,
    description: '¿Cuánto necesitas para arrancar?',
    fields: [
      { key: 'inversion_total', label: '¿Cuánto necesitas de inversión inicial?', placeholder: 'Ej: $300,000 MXN' },
      { key: 'fuentes_capital', label: '¿De dónde viene el dinero?', placeholder: 'Ej: 60% ahorros propios, 30% crédito PyME, 10% inversionista' },
      { key: 'costos_fijos', label: '¿Cuáles son tus costos fijos mensuales estimados?', placeholder: 'Ej: Renta $12K, Nómina $95K, Servicios $3K, Software $5K' },
      { key: 'meta_ingresos', label: '¿Cuánto esperas facturar en el primer año?', placeholder: 'Ej: $1,200,000 MXN' }
    ]
  },
  {
    id: 'impacto',
    title: 'Impacto y Visión',
    icon: Heart,
    description: '¿Qué impacto tendrás en tu comunidad?',
    fields: [
      { key: 'impacto_social', label: '¿Cómo beneficia tu negocio a la comunidad?', placeholder: 'Ej: Educación financiera gratuita para jóvenes, empleos formales, cultura de ahorro', type: 'textarea' },
      { key: 'vision_5_anos', label: '¿Dónde te ves en 5 años?', placeholder: 'Ej: Líder en consultoría patrimonial digital en el noroeste de México, 5,000+ clientes, expansión a 3 estados' },
      { key: 'compromiso', label: '¿Cuál es tu nivel de compromiso con este proyecto?', placeholder: 'Ej: Estoy 100% comprometido, ya renuncié a mi empleo / Lo iniciaré como side-project' }
    ]
  },
  {
    id: 'anexos',
    title: 'Contexto Externo',
    icon: FileText,
    description: 'Sube documentos para nutrir la Inteligencia Artificial.',
    fields: [
      { key: 'contexto_externo', label: 'Sube un PDF o escribe contexto libre', type: 'custom_ocr' }
    ]
  }
];

const SOCIAL_STEPS = [
  {
    id: 'problema_social',
    title: 'El Problema',
    icon: Lightbulb,
    description: '¿Qué problema público o social quieres resolver?',
    fields: [
      { key: 'problema_central', label: 'Problema central (en negativo)', placeholder: 'Ej: Alto índice de deserción escolar en educación media superior en la zona sur' },
      { key: 'causas_principales', label: 'Causas principales de este problema', placeholder: 'Ej: Falta de recursos económicos, desinterés por el currículo tradicional', type: 'textarea' },
      { key: 'efectos_principales', label: 'Efectos principales si no se resuelve', placeholder: 'Ej: Aumento de la delincuencia juvenil, empleos precarizados a futuro', type: 'textarea' }
    ]
  },
  {
    id: 'beneficiarios',
    title: 'Los Beneficiarios',
    icon: Users,
    description: '¿A quiénes va dirigido el proyecto?',
    fields: [
      { key: 'poblacion_objetivo', label: 'Población objetivo', placeholder: 'Ej: 500 jóvenes de 15 a 18 años en rezago educativo en la colonia X' },
      { key: 'caracteristicas', label: 'Características socioeconómicas', placeholder: 'Ej: Familias de estrato D y E, padres con educación básica incompleta' },
      { key: 'necesidad_sentida', label: '¿Qué necesidad prioritaria expresan ellos?', placeholder: 'Ej: Necesidad de obtener ingresos rápidos y aprender oficios prácticos' }
    ]
  },
  {
    id: 'objetivos',
    title: 'Objetivos del Proyecto',
    icon: Trophy,
    description: '¿Qué quieres lograr?',
    fields: [
      { key: 'objetivo_general', label: 'Objetivo General (Impacto a largo plazo)', placeholder: 'Ej: Contribuir a la reducción de la marginación urbana mediante la inserción laboral' },
      { key: 'proposito', label: 'Propósito Específico (Meta directa del proyecto)', placeholder: 'Ej: Jóvenes de 15-18 años completan capacitación técnica y se insertan laboralmente' },
      { key: 'componentes', label: '¿Qué productos o servicios entregarás?', placeholder: 'Ej: 1) Centro de cómputo equipado. 2) 3 Talleres de oficios impartidos', type: 'textarea' }
    ]
  },
  {
    id: 'actores',
    title: 'Actores Involucrados',
    icon: User,
    description: '¿Quiénes participan o se ven afectados?',
    fields: [
      { key: 'equipo_promotor', label: 'Tu organización o equipo', placeholder: 'Ej: ONG EduFuturo con 5 años de experiencia en la zona' },
      { key: 'aliados_clave', label: 'Aliados principales', placeholder: 'Ej: Fundación X (donante), Secretaría de Educación (aval)' },
      { key: 'oponentes_riesgos', label: 'Posibles oponentes o riesgos', placeholder: 'Ej: Sindicatos locales, grupos delictivos en la zona' }
    ]
  },
  {
    id: 'recursos',
    title: 'Presupuesto y Recursos',
    icon: DollarSign,
    description: '¿Qué necesitas para operar?',
    fields: [
      { key: 'presupuesto_estimado', label: 'Presupuesto total estimado', placeholder: 'Ej: $500,000 MXN para el primer año' },
      { key: 'fuentes_financiamiento', label: 'Fuentes de financiamiento', placeholder: 'Ej: 70% Fondo Internacional, 30% Contrapartida local en especie' },
      { key: 'principales_costos', label: 'Principales rubros de gasto', placeholder: 'Ej: Honorarios de instructores, adecuación de aulas, compra de equipo' }
    ]
  },
  {
    id: 'sostenibilidad',
    title: 'Sostenibilidad',
    icon: Heart,
    description: '¿Cómo perdurará el impacto?',
    fields: [
      { key: 'sostenibilidad_financiera', label: '¿Cómo se mantendrá al terminar el donativo?', placeholder: 'Ej: Venta de servicios técnicos realizados por los alumnos, cuota de recuperación' },
      { key: 'apropiacion', label: '¿Cómo aseguras la apropiación de la comunidad?', placeholder: 'Ej: Comité vecinal administrará el centro en el año 2' }
    ]
  },
  {
    id: 'anexos',
    title: 'Contexto Externo',
    icon: FileText,
    description: 'Sube documentos para nutrir la Inteligencia Artificial.',
    fields: [
      { key: 'contexto_externo', label: 'Sube un PDF o escribe contexto libre', type: 'custom_ocr' }
    ]
  }
];

export default function Semilla() {
  const { planData, updateSection, updateConfig } = usePlan();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const semillaData = planData.semilla || {};

  const projectType = planData.config?.projectType || 'business';
  const STEPS = projectType === 'social_bid' ? SOCIAL_STEPS : BUSINESS_STEPS;

  const step = STEPS[currentStep] || STEPS[0];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / STEPS.length) * 100;


  const handleChange = (key, value) => {
    updateSection('semilla', step.id, key, value);
  };

  const getFieldValue = (key) => {
    return semillaData[step.id]?.[key] || '';
  };

  const _isStepComplete = () => {
    return step.fields.some(f => getFieldValue(f.key).trim() !== '');
  };

  const completedSteps = STEPS.filter((s, _i) => {
    const data = semillaData[s.id] || {};
    return s.fields.some(f => (data[f.key] || '').trim() !== '');
  }).length;

  return (
    <div className="module-view" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="view-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="view-title">🌱 Semilla del Proyecto</h1>
          <p className="text-secondary mt-1">Entrevista inicial con el emprendedor — Esta información es el contexto prioritario para la IA.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.85rem' }}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{completedSteps} de {STEPS.length} secciones</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        height: '4px', 
        background: 'var(--border-color)', 
        borderRadius: '2px', 
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: 'linear-gradient(90deg, var(--accent-color), #8b5cf6)',
          borderRadius: '2px',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Step Navigation Pills */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => {
          const SIcon = s.icon;
          const isComplete = (semillaData[s.id] && Object.values(semillaData[s.id]).some(v => v?.trim?.()));
          return (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: i === currentStep ? 'var(--accent-color)' : 'var(--border-color)',
                background: i === currentStep ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: i === currentStep ? 'var(--accent-color)' : isComplete ? 'var(--success-color)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: i === currentStep ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <SIcon className="w-3 h-3" />}
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: '48px', height: '48px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <StepIcon className="w-6 h-6" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>
              Paso {currentStep + 1}: {step.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{step.description}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {step.fields.map(field => (
            <div key={field.key}>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="form-control"
                  placeholder={field.placeholder}
                  value={getFieldValue(field.key)}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
              ) : field.type === 'custom_ocr' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <PdfOcrReader 
                    onTextExtracted={(text) => {
                      const currentVal = getFieldValue(field.key);
                      handleChange(field.key, currentVal + '\n' + text);
                    }} 
                  />
                  <textarea
                    className="form-control"
                    placeholder="El texto extraído aparecerá aquí. También puedes escribir o pegar texto adicional directamente..."
                    value={getFieldValue(field.key)}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    style={{ minHeight: '200px', resize: 'vertical', fontSize: '0.85rem' }}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  placeholder={field.placeholder}
                  value={getFieldValue(field.key)}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}

          {/* Tarjeta de Generación de Logotipo Inteligente en el paso de Marketing */}
          {step.id === 'marketing' && (
            <div style={{
              marginTop: '0.5rem',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid var(--accent-color, #6366f1)',
              background: 'rgba(99, 102, 241, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: '4px'
                }}>
                  {planData.config?.brandKit?.logoUrl ? (
                    <img src={planData.config.brandKit.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Identidad Visual y Logotipo con IA</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Genera el isotipo vectorial oficial de tu marca con Pollinations Flux y motores gráficos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.2rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '10px'
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>{planData.config?.brandKit?.logoUrl ? 'Cambiar Logotipo' : 'Diseñar Logotipo con IA'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Generación de Logotipos */}
      <LogoGeneratorModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        projectId={planData.config?.projectId}
        projectType={projectType === 'social_bid' ? 'social' : 'negocios'}
        pollinationsKey={planData.config?.ai?.pollinationsKey || ''}
        initialBrandData={{
          companyName: getFieldValue('nombre_marca') || planData.config?.brandKit?.companyName || '',
          giro: planData.semilla?.negocio?.que_es || planData.semilla?.negocio?.producto_servicio || '',
          isotipoDesc: '',
          primaryColor: planData.config?.brandKit?.primaryColor || '#6366f1',
          secondaryColor: planData.config?.brandKit?.secondaryColor || '#10b981'
        }}
        onSelectLogo={(dataUrl, meta) => {
          if (meta?.companyName) {
            handleChange('nombre_marca', meta.companyName);
          }
          updateConfig('brandKit', {
            ...(planData.config?.brandKit || {}),
            logoUrl: dataUrl,
            companyName: getFieldValue('nombre_marca') || planData.config?.brandKit?.companyName,
            primaryColor: meta?.primaryColor || planData.config?.brandKit?.primaryColor || '#6366f1',
            secondaryColor: meta?.secondaryColor || planData.config?.brandKit?.secondaryColor || '#10b981'
          });
        }}
      />

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button
          className="btn"
          style={{ 
            background: 'var(--bg-panel)', 
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            opacity: currentStep === 0 ? 0.4 : 1,
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
          }}
          onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            className="btn btn-ia"
            onClick={() => {
              alert('✅ ¡Semilla guardada! Ahora la IA usará esta información como contexto prioritario al generar cualquier módulo del plan.');
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Semilla Lista</span>
          </button>
        )}
      </div>
    </div>
  );
}
