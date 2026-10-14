import {readFile,writeFile} from 'node:fs/promises';
import {parseScenarioJSON,simulate,exportRun} from './engine.mjs';
import {scenarios} from './scenarios.mjs';
import {reportHTML} from './report.mjs';
try {
 const arg=process.argv[2];
 const scenario=scenarios.find(s=>s.id===arg) ?? (arg ? parseScenarioJSON(await readFile(arg,'utf8')) : scenarios[0]);
 const run=simulate(scenario);
 if(process.argv[3]) await writeFile(process.argv[3],process.argv[3].endsWith('.html')?reportHTML(run):JSON.stringify(exportRun(run),null,2));
 console.log(JSON.stringify({scenario:scenario.title,...run.summary},null,2));
 process.exitCode=run.summary.passed===4?0:1;
} catch(error){console.error(error.message);process.exitCode=2;}
