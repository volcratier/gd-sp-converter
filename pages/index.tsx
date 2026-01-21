'use client';

import { useState } from 'react';
import { Sun, Moon, Languages, HelpCircle, Download, FileJson, FileSpreadsheet, FileUp } from 'lucide-react';

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState<'jp' | 'en'>('jp');
  const [showHelp, setShowHelp] = useState(false);

  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('シート1');
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const t = {
    jp: {
      title: "GD↔SP Converter",
      subtitle: "ファイルベースの安全なデータ連携",
      readTitle: "📥 シート → JSON保存",
      writeTitle: "📤 JSON → CSV変換",
      idLabel: "スプレッドシートID",
      sheetLabel: "シート名",
      jsonLabel: "JSONの中身を貼り付け",
      btnDownloadJson: "JSONを保存",
      btnDownloadCsv: "CSVを保存",
      helpTitle: "ファイル連携のガイド",
      help1: "1. スプレッドシートを「リンクを知っている全員」に公開します。",
      help2: "2. 左の枠でIDを入力し、JSONを保存してGDevelopで読み込みます。",
      help3: "3. GDevelopのJSONを右の枠に貼り、CSVを保存します。",
      help4: "4. CSVをスプレッドシートの「ファイル > インポート」で読み込みます。",
      error: "❌ 形式を確認してください",
    },
    en: {
      title: "GD↔SP Converter",
      subtitle: "Secure File-based Workflow",
      readTitle: "📥 Sheet → Save JSON",
      writeTitle: "📤 JSON → Save CSV",
      idLabel: "Spreadsheet ID",
      sheetLabel: "Sheet Name",
      jsonLabel: "Paste JSON Content",
      btnDownloadJson: "Download JSON",
      btnDownloadCsv: "Download CSV",
      helpTitle: "Quick Guide",
      help1: "1. Set Sheet access to 'Anyone with the link'.",
      help2: "2. Enter ID on left and save JSON for GDevelop.",
      help3: "3. Paste GDevelop JSON on right to create CSV.",
      help4: "4. Import CSV into Sheets via 'File > Import'.",
      error: "❌ Check format",
    }
  }[lang];

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSheetToJson = async () => {
    setLoading(true);
    try {
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const content = JSON.parse(data.contents.match(/google.visualization.Query.setResponse\((.*)\)/)[1]);
      const columns = content.table.cols.map((col: any) => col.label || `col_${col.id}`);
      const rows = content.table.rows.map((row: any) => {
        const rowData: { [key: string]: any } = {};
        row.c.forEach((cell: any, index: number) => {
          if (cell && cell.v !== null) rowData[columns[index]] = cell.v;
        });
        return rowData;
      });
      downloadFile(JSON.stringify(rows, null, 2), `${sheetName}.json`, 'application/json');
    } catch (err) {
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleJsonToCsv = () => {
    try {
      const json = JSON.parse(jsonInput);
      const dataArray = Array.isArray(json) ? json : [json];
      const headers = Object.keys(dataArray[0]);
      const csvContent = [
        headers.join(','),
        ...dataArray.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(','))
      ].join('\n');
      downloadFile(csvContent, 'gd_to_sheet.csv', 'text/csv;charset=utf-8;');
    } catch (err) {
      alert(t.error);
    }
  };

  return (
    <div className={`${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen transition-all duration-300 p-4 md:p-8 font-sans`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-6 text-slate-900 dark:text-white">
          <div>
            <h1 className="text-4xl font-black text-blue-500 tracking-tighter italic">{t.title}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLang(lang === 'jp' ? 'en' : 'jp')} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-105 transition active:scale-95 shadow-sm text-slate-900 dark:text-white"><Languages size={20} /></button>
            <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-105 transition active:scale-95 shadow-sm text-slate-900 dark:text-white">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
            <button onClick={() => setShowHelp(!showHelp)} className={`p-2.5 rounded-xl transition hover:scale-105 active:scale-95 shadow-lg ${showHelp ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'}`}><HelpCircle size={20} /></button>
          </div>
        </header>

        {showHelp && (
          <div className={`${isDark ? 'bg-blue-900/20 border-blue-500/30 text-slate-300' : 'bg-blue-100 border-blue-200 text-blue-900'} border p-6 rounded-3xl shadow-inner`}>
            <h3 className={`font-black mb-4 flex items-center gap-2 text-lg ${isDark ? 'text-blue-400' : 'text-blue-700'}`}><HelpCircle size={22}/> {t.helpTitle}</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <p className="font-bold text-blue-500 uppercase tracking-wider">Sheet → GDevelop</p>
                <p>{t.help1}</p><p>{t.help2}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-orange-500 uppercase tracking-wider">GDevelop → Sheet</p>
                <p>{t.help3}</p><p>{t.help4}</p>
              </div>
            </div>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <section className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} p-8 rounded-[2rem] border transition-all`}>
            <div className="flex items-center gap-3 mb-8 text-blue-500">
              <div className="p-3 bg-blue-500/10 rounded-2xl"><FileJson size={32} /></div>
              <h2 className="text-2xl font-black italic">{t.readTitle}</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.idLabel}</label>
                <input type="text" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} className="w-full mt-1.5 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 transition outline-none text-slate-900 dark:text-white font-medium" placeholder="ID..." />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.sheetLabel}</label>
                <input type="text" value={sheetName} onChange={(e) => setSheetName(e.target.value)} className="w-full mt-1.5 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 transition outline-none text-slate-900 dark:text-white font-medium" />
              </div>
              <button onClick={handleSheetToJson} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-lg">
                <Download size={22} /> {loading ? '...' : t.btnDownloadJson}
              </button>
            </div>
          </section>

          <section className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xl'} p-8 rounded-[2rem] border transition-all`}>
            <div className="flex items-center gap-3 mb-8 text-orange-500">
              <div className="p-3 bg-orange-500/10 rounded-2xl"><FileSpreadsheet size={32} /></div>
              <h2 className="text-2xl font-black italic">{t.writeTitle}</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.jsonLabel}</label>
                <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} className="w-full h-44 mt-1.5 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 transition outline-none font-mono text-sm text-slate-900 dark:text-white" placeholder='Paste JSON here...' />
              </div>
              <button onClick={handleJsonToCsv} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-lg">
                <FileUp size={22} /> {t.btnDownloadCsv}
              </button>
            </div>
          </section>
        </main>

        <footer className="text-center pt-12 pb-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
            Developed by <span className="text-blue-500 font-black">Cratier</span>
          </p>
          <p className="text-slate-400 dark:text-slate-600 text-[10px] font-medium tracking-[0.3em]">
            CREATED WITH GEMINI
          </p>
        </footer>
      </div>
    </div>
  );
}