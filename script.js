document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#query_form');
  if (form) {
    const placa = form.querySelector('input[name="form_fields[query_field]"]');

    form.addEventListener('submit', async function(event) {
      event.preventDefault();
      const loading = document.createElement('h3');
      loading.textContent = 'aguarde, baixando consulta...';
      form.append(loading);
      
      // const get13code = await getVehicleInfos(placa.value, 13);
      // if(get13code){
      //   const get175code = await getVehicleInfos(placa.value, 175);
      //   gerarPDF({...get13code.body.data, ...get175code.body.data});
      // }

      const response = await fetch('data.json');
      const data = await response.json();  
      gerarPDF(data)
      loading.remove();
      
    });
  }
});

async function getVehicleInfos(value, code) {
 try {
   const response = await fetch('https://api.checktudo.com.br/api/vehicle/6633c5d136efa76e708b4f86', {
     method: "POST",
     headers: {
       "apiKey": "eyJ0b2tlbiI6IjkxMmM2YWU1LTU1YjgtNDE4YS1iMjI3LWU1YTA3ZTQxMjliNCIsInVzZXJJZCI6IjY2MzNjNWQxMzZlZmE3NmU3MDhiNGY4NiJ9",
       "Content-Type": "application/json"
     },
     body: JSON.stringify({
       "querycode": code,
       "duplicity": true,
       "keys": {
         "placa": value
       } 
     }),
     redirect: "follow"
   });

   if (response.ok) {
     return response.json();
   } else {
     const data = await response.json();
     alert(data.body?.error?.msg || "Erro desconhecido");
     return null;
   }
 } catch (error) {
   console.error("Erro na requisição:", error);
   alert("Erro na conexão com o servidor.");
   return null;
 }
}
                  
async function gerarPDF(data) {
  const url = 'modelo.pdf';
  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
  const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  //  preencher formulario
  form.getTextField('placaID').setText(data.baseEstadual.placa);

  function checkValues(vars) {
    console.log(vars)
    return vars.every(v => v === null || v.toLowerCase() === 'nao' || v.toLowerCase() === "nada consta");
  }

  if(checkValues([data.baseNacional.indicadorRestricaoRenajud, data.baseNacional.outrasRestricoes1, data.baseNacional.outrasRestricoes2, data.baseNacional.outrasRestricoes3, data.baseNacional.outrasRestricoes4, data.baseNacional.outrasRestricoes5, data.baseNacional.outrasRestricoes6, data.baseNacional.outrasRestricoes7, data.baseNacional.outrasRestricoes8, data.baseNacional.restricao1, data.baseNacional.restricao2, data.baseNacional.restricao3, data.baseNacional.restricao4, data.baseNacional.restricaoDataInclusao, data.baseNacional.restricaoFinanciadora, data.baseNacional.restricaoFinanciamento, data.baseNacional.restricaoNomeAgente, data.baseNacional.restricaoTipoTransacao])){
    const resNaciField = form.getTextField('resNaci')
    resNaciField.setText('NÃO');
  }

  const motorAltField = form.getTextField('motorAlt')
  motorAltField.setText(data.baseEstadual.dataAlteracaoMotor ? 'SIM' : 'NÃO');

  const indicioSinField = form.getTextField('indicioSin')
  indicioSinField.setText(data.indicioSinistro.classificacao ? 'SIM' : 'NÃO');

  const chassiReField = form.getTextField('chassiRe')
  chassiReField.setText(data.baseEstadual.tipoMarcacaoChassi.toLowerCase() !== 'normal' ? 'SIM' : 'NÃO');

  const HisReFField = form.getTextField('hisReF')
  HisReFField.setText(data.rouboFurto.historico.length > 0 ? 'SIM' : 'NÃO');

  if(checkValues([data.baseEstadual.dataLimiteRestricaoTributaria, data.baseEstadual.intencaoRestricaoFinanceira, data.baseEstadual.outrasRestricoes1, data.baseEstadual.outrasRestricoes2, data.baseEstadual.outrasRestricoes3, data.baseEstadual.outrasRestricoes4, data.baseEstadual.restricaoAdminisrativa, data.baseEstadual.restricaoAmbiental, data.baseEstadual.restricaoArrendatario, data.baseEstadual.restricaoDataInclusao, data.baseEstadual.restricaoDocArrendatario, data.baseEstadual.restricaoFinanceira, data.baseEstadual.restricaoGuincho, data.baseEstadual.restricaoJudicial, data.baseEstadual.restricaoNomeAgente, data.baseEstadual.restricaoRenajud, data.baseEstadual.restricaoRouboFurto, data.baseEstadual.restricaoTributaria])){
    const resEstaField = form.getTextField('resEsta')
    resEstaField.setText('NÃO');
  }

  const regLeiField = form.getTextField('regLei')
  regLeiField.setText(data.leilao.registros.length > 0 ? 'SIM' : 'NÃO');

  // baixar pdf

  const pdfBytes = await pdfDoc.save();
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
  downloadLink.download = `${data.baseEstadual.placa}_resultado.pdf`;
  downloadLink.click();
}
		