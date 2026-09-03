import { BoxCanvas } from './BoxCanvas.jsx';
import { BoxMatrix } from './BoxMatrix.jsx';
import { BoxFormula } from './BoxFormula.jsx';
import { BoxChecklist } from './BoxChecklist.jsx';
import { BoxBenchmark } from './BoxBenchmark.jsx';
import { BoxTable } from './BoxTable.jsx';
import { BoxDNSH } from './BoxDNSH.jsx';
import { BoxMatrizX } from './BoxMatrizX.jsx';
import { BoxAmoeba } from './BoxAmoeba.jsx';
import { BoxGuanxi } from './BoxGuanxi.jsx';
import { BoxONUDI } from './BoxONUDI.jsx';
import { BoxArbolProblemasMML } from './BoxArbolProblemasMML.jsx';
import { BoxLayoutIndustrial } from './BoxLayoutIndustrial.jsx';
import MicroCroquisEditor from '../MicroCroquisEditor.jsx';
import { BOX_TYPES } from '../../config/boxes.js';

export {
  BoxCanvas,
  BoxMatrix,
  BoxFormula,
  BoxChecklist,
  BoxBenchmark,
  BoxTable,
  BoxDNSH,
  BoxMatrizX,
  BoxAmoeba,
  BoxGuanxi,
  BoxONUDI,
  BoxArbolProblemasMML,
  BoxLayoutIndustrial,
  MicroCroquisEditor
};

/**
 * Renderiza dinámicamente el componente de Box adecuado según su ID especializado o su tipo general
 */
export function RenderBox({ definition = {}, values = {}, onChange = () => {} }) {
  if (!definition) return null;

  // 1. Enrutamiento por ID especializado (Componentes Personalizados 100%)
  switch (definition.id) {
    case 'box_micro_croquis_2d':
      return (
        <MicroCroquisEditor 
          data={values} 
          onUpdateField={(field, val) => onChange({ ...values, [field]: val })} 
        />
      );
    case 'box_dnsh_ue_6':
      return <BoxDNSH definition={definition} values={values} onChange={onChange} />;
    case 'box_matriz_x_hoshin':
      return <BoxMatrizX definition={definition} values={values} onChange={onChange} />;
    case 'box_rentabilidad_hora_amoeba':
      return <BoxAmoeba definition={definition} values={values} onChange={onChange} />;
    case 'box_mapa_guanxi_mianzi':
      return <BoxGuanxi definition={definition} values={values} onChange={onChange} />;
    case 'box_fcff_onudi_model':
      return <BoxONUDI definition={definition} values={values} onChange={onChange} />;
    case 'box_arbol_problemas_mml':
      return <BoxArbolProblemasMML definition={definition} values={values} onChange={onChange} />;
    case 'box_layout_industrial':
      return <BoxLayoutIndustrial definition={definition} values={values} onChange={onChange} />;
    default:
      break;
  }

  // 2. Enrutamiento por Tipo General
  switch (definition.type) {
    case BOX_TYPES.CANVAS:
      return <BoxCanvas definition={definition} values={values} onChange={onChange} />;
    case BOX_TYPES.MATRIX:
      return <BoxMatrix definition={definition} values={values} onChange={onChange} />;
    case BOX_TYPES.FORMULA:
      return <BoxFormula definition={definition} values={values} onChange={onChange} />;
    case BOX_TYPES.CHECKLIST:
      return <BoxChecklist definition={definition} values={values} onChange={onChange} />;
    case BOX_TYPES.BENCHMARK:
      return <BoxBenchmark definition={definition} values={values} onChange={onChange} />;
    case BOX_TYPES.TABLE:
      return <BoxTable definition={definition} values={values} onChange={onChange} />;
    default:
      return <BoxTable definition={definition} values={values} onChange={onChange} />;
  }
}
