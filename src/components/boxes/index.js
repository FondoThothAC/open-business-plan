import { BoxCanvas } from './BoxCanvas.jsx';
import { BoxMatrix } from './BoxMatrix.jsx';
import { BoxFormula } from './BoxFormula.jsx';
import { BoxChecklist } from './BoxChecklist.jsx';
import { BoxBenchmark } from './BoxBenchmark.jsx';
import { BoxTable } from './BoxTable.jsx';
import { BOX_TYPES } from '../../config/boxes.js';

export {
  BoxCanvas,
  BoxMatrix,
  BoxFormula,
  BoxChecklist,
  BoxBenchmark,
  BoxTable
};

/**
 * Renderiza dinámicamente el componente de Box adecuado según su tipo
 */
export function RenderBox({ definition = {}, values = {}, onChange = () => {} }) {
  if (!definition || !definition.type) return null;

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
