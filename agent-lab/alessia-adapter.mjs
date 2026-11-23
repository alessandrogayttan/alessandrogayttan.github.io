import {validateScenario} from './engine.mjs';
const map={consultar_precios_y_servicios:'retrieve_docs',consultar_talleres_y_servicios:'retrieve_docs',consultar_sitio_inpulso:'retrieve_docs',buscar_conocimiento_inpulso:'retrieve_docs',consultar_agenda:'lookup_availability',consultar_mis_citas:'lookup_availability',agendar_cita:'create_booking',escalar_a_recepcion:'escalate_human'};
/** Explicit trace contract; does not connect to Alessia or execute its tools. */
export function fromAlessiaTrace(calls){
 if(!Array.isArray(calls)) throw new Error('Expected an array of normalized Alessia calls.');
 return validateScenario({version:1,id:'alessia-import',title:'Imported Alessia contract trace',description:'Replay of supplied observations, not a live production execution.',events:calls.map((c,i)=>{
   if(!Object.hasOwn(map,c.name)) throw new Error('Unsupported Alessia tool: '+c.name);
   const tool=map[c.name],write=['create_booking','escalate_human'].includes(tool);
   return {id:'call-'+i,tool,label:c.name,operationId:c.operationId,args:c.args??{},approved:c.approved??false,costMicros:c.costMicros,latencyMs:c.latencyMs,outcomes:c.outcomes?.map(o=>write&&o==='timeout'?'unknown':o)};
 })});
}
