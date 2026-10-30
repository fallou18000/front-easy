function telecharger(contenu, nom, type) {
  const url = URL.createObjectURL(new Blob([contenu], { type }));
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  document.body.append(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}

const celluleCsv = (v) => {
  let s = String(v ?? '');
  // Un texte qui commence par = + - @ serait exécuté comme formule par Excel
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
};

export const exporterCsv = (lignes, nom) =>
  telecharger(
    '\uFEFF' + lignes.map((l) => l.map(celluleCsv).join(';')).join('\r\n'),
    `${nom}.csv`,
    'text/csv;charset=utf-8'
  );

const echapperXml = (v) =>
  String(v ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export function exporterExcel(lignes, nom) {
  const corps = lignes
    .map((l) => `<Row>${l.map((c) =>
      `<Cell><Data ss:Type="${typeof c === 'number' ? 'Number' : 'String'}">${echapperXml(c)}</Data></Cell>`
    ).join('')}</Row>`)
    .join('');
  const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>`
    + `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" `
    + `xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`
    + `<Worksheet ss:Name="Rapport"><Table>${corps}</Table></Worksheet></Workbook>`;
  telecharger('\uFEFF' + xml, `${nom}.xml`, 'application/vnd.ms-excel;charset=utf-8');
}