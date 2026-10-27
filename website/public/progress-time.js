// Compilation timestamps are not source collection dates or deployment times.
let AUDIT_PROGRESS_TIMESTAMP=null;
let AUDIT_PROGRESS_TIME_STATE='loading';
function formatProgressHKT(value){if(typeof value!=='string'||!value.trim())return null;const date=new Date(value);if(!Number.isFinite(date.getTime()))return null;return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(date)+' HKT (UTC+8)'}
function renderProgressTimestamp(){const el=document.querySelector('#updated');if(!el)return;const t=formatProgressHKT(AUDIT_PROGRESS_TIMESTAMP);el.textContent='核验进度编制时间：'+(t|| (AUDIT_PROGRESS_TIME_STATE==='failed'?'暂时无法读取':AUDIT_PROGRESS_TIME_STATE==='loaded'?'未提供有效时间':'待加载'));el.title='进度数据的编制时间，不代表所有来源重新检查或网站部署时间。'}
function setAuditProgressTimestamp(value,state='loaded'){AUDIT_PROGRESS_TIMESTAMP=value;AUDIT_PROGRESS_TIME_STATE=state;renderProgressTimestamp()}
renderProgressTimestamp();
