/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @name tkiio_pl_unificacion_tarj_sl
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Script que servirá para generar la pantalla de unificación de tarjeta
 * @copyright Tekiio México 2023
 * 
 * Client              -> Vinoteca
 * Last modification   -> 11/08/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> PL - Unificacion de tarjetas <customscript_tkiio_pl_unificacion_tarjet>
 */
define(['N/log', 'N/ui/serverWidget', 'N/search', 'N/url', 'N/record'],
    /**
 * @param{log} log
 * @param{serverWidget} serverWidget
 */
    (log, serverWidget, search, url, record) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                var request = scriptContext.request;
                var params = request.parameters;
                var response = scriptContext.response;
                log.debug({title:'Start', details:params});
                if (request.method == 'POST') { // Si es petición POST se crea registro de unificacion
                    var data = JSON.parse(params.data);
                    log.debug({title:'Data post', details:data});
                    if (data.data.length) {
                        let resultRecord = createUnifyRecord(data.data)
                        log.debug({ title:'resultRecord', details:resultRecord });
                        if (resultRecord.success == true) {
                            var result = {regCreated: resultRecord.recordId}
                            response.writeLine({output: JSON.stringify(result)});
                        }
                    }
                }else{ // Si es GET se crea la interfaz para buscar información.
                    var form = createInterface(params);
                    if (params.filtering) { // se agregan resultados filtrados a la interfaz
                        log.debug({title:'Datos', details:'filtrando'});
                        var searchResult = searchResults(params);
                        log.debug({title:'searchResult', details:searchResult});
                        if (searchResult.success == false) {
                            var errorField = form.getField({
                                id: 'custpage_pl_ut_errors'
                            });
                            errorField.defaultValue = searchResult.error;
                        }else{
                            setResults(form, searchResult.result);
                        }
                    }else{ // se muestra la interfaz en blanco
                        log.debug({title:'Creando', details:'Creando interfaz'});
                    }
                    scriptContext.response.writePage({ pageObject: form });
                }
            } catch (error) {
                log.error({title: 'error onRequest: ', details: error});
            }
        }

        const createInterface = (params) =>{
            try {
                
                let form = serverWidget.createForm({
                    title: 'Unificación de Tarjetas'
                });

                form.clientScriptModulePath = './fb_pl_unificacion_tarj_CS.js';
                var fieldgroup = form.addFieldGroup({
                    id: "fieldgroup_pl_filters",     
                    label: 'Filtros'
                });
                /** Filters Fields */
                let btnFiltrar = form.addButton({
                    id: "button_pl_ut_filtrar",
                    label: 'Filtrar',
                    functionName: 'filterData'
                });

                let btnUnificar = form.addButton({
                    id: "button_pl_ut_unificar",
                    label: 'Unificar',
                    functionName: 'unifyData'                
                });

                let nameField = form.addField({
                    id: "custpage_pl_ut_name_socio",
                    type: serverWidget.FieldType.TEXT,
                    label: "Nombre Socio",
                    container: "fieldgroup_pl_filters"
                });
                if (params.name) {
                    nameField.defaultValue = params.name;
                }

                let birthdayField = form.addField({
                    id: "custpage_pl_ut_birthdate",
                    type: serverWidget.FieldType.DATE,
                    label: "Fecha de Nacimiento DD/MM/YYYY",
                    container: "fieldgroup_pl_filters"
                });
                if (params.birthday) {
                    birthdayField.defaultValue = params.birthday;
                }

                let emailField = form.addField({
                    id: "custpage_pl_ut_email",
                    type: serverWidget.FieldType.EMAIL,
                    label: "Correo electrónico",
                    container: "fieldgroup_pl_filters"
                });
                if (params.email) {
                    emailField.defaultValue = params.email;
                }

                let errorsField = form.addField({
                    id: "custpage_pl_ut_errors",
                    type: serverWidget.FieldType.TEXTAREA,
                    label: "Errors",
                    container: "fieldgroup_pl_filters"
                });
                errorsField.defaultValue = '';
                errorsField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                 //Create the sublist
                 var sublist = form.addSublist({
                    id: 'sublistid_pl_ut_results',
                    type: serverWidget.SublistType.LIST,
                    label: 'Resultados'
                });

                var checkMaster = sublist.addField({
                    id: "fieldid_pl_ut_check_select_mast",
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Registro Maestro'
                });

                var checkSelect = sublist.addField({
                    id: "fieldid_pl_ut_check_select",
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Check selección'
                });

                var cardNum = sublist.addField({
                    id: "fieldid_pl_ut_card_num",
                    type: serverWidget.FieldType.TEXT,
                    label: 'Número Tarjeta'
                });
                var cardNumID = sublist.addField({
                    id: "fieldid_pl_ut_card_num_id",
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID Tarjeta'
                });
                cardNumID.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var customer = sublist.addField({
                    id: "fieldid_pl_ut_client_name",
                    type: serverWidget.FieldType.TEXT,
                    label: 'Cliente'
                });
                var customerID = sublist.addField({
                    id: "fieldid_pl_ut_client_name_id",
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID Cliente'
                });
                customerID.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var partner = sublist.addField({
                    id: "fieldid_pl_ut_partner",
                    type: serverWidget.FieldType.TEXT,
                    label: 'Socio'
                });
                var partnerID = sublist.addField({
                    id: "fieldid_pl_ut_partner_id",
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID Socio'
                });
                partnerID.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var partnerBirthdat = sublist.addField({
                    id: "fieldid_pl_ut_partner_birthday",
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha de nacimiento'
                });

                var customerRFC = sublist.addField({
                    id: "fieldid_pl_ut_client_rfc",
                    type: serverWidget.FieldType.TEXT,
                    label: 'RFC'
                });

                var partnerDesde = sublist.addField({
                    id: "fieldid_pl_ut_partner_desde",
                    type: serverWidget.FieldType.DATE,
                    label: 'Miembro desde'
                });

                return form;
            } catch (error) {
                log.error({ title: 'Error on createInterface', details: error });
                var formerror = errForm(error);
                return formerror;
            }
        }

        function searchResults(params) {
            const response = {success: false, error: '', result: ''};
            try {
                log.debug({ title:'Searching Data', details:params });
                let searchFilters = [["isinactive","is","F"]];
                if (params.email) {
                    searchFilters.push("AND");
                    searchFilters.push(["custrecord_efx_lealtad_correoelectsocio", search.Operator.IS, params.email]);
                }
                if (params.name) {
                    searchFilters.push("AND");
                    searchFilters.push(["name", search.Operator.IS, params.name]);
                }
                if (params.birthday) {
                    searchFilters.push("AND");
                    searchFilters.push(["custrecord_efx_lealtad_sociofechanacimie", search.Operator.ON, params.birthday]);
                }
                log.debug({ title:'searchFilters', details:searchFilters });
                var sociosDuplicadosSearch = search.create({
                    type: "customrecord_efx_lealtad_socios",
                    filters:searchFilters,
                    columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            sort: search.Sort.ASC,
                            label: "ID interno"
                        }),
                        search.createColumn({name: "custrecord_efx_lealtad_clienterelsocio", label: "Cliente relacionado"}),
                        search.createColumn({name: "custrecord_efx_lealtad_numtarjetasocio", label: "Número de tarjeta de socio"}),
                        search.createColumn({name: "custrecord_efx_lealtad_socionumerodesoci", label: "Número de socio de programa de lealtad"}),
                        search.createColumn({name: "custrecord_efx_lealtad_sociofechanacimie", label: "Fecha de nacimiento del socio"}),
                        search.createColumn({
                            name: "custentity_mx_rfc",
                            join: "CUSTRECORD_EFX_LEALTAD_CLIENTERELSOCIO",
                            label: "RFC"
                        }),
                        search.createColumn({name: "custrecord_efx_lealtad_miembrodesde", label: "Miembro desde"}),
                        search.createColumn({name: "name", label: "Nombre"})
                    ]
                });
                var duplicadosResult = sociosDuplicadosSearch.runPaged({
                    pageSize: 1000
                });
                log.debug("Registros duplicados",duplicadosResult.count);
                if (duplicadosResult.count > 0) {
                    if (duplicadosResult.count > 1) {
                        log.debug({ title:'Duplicado encontrado', details:'Duplicado encontrado' });
                        let dataFound = [];
                        duplicadosResult.pageRanges.forEach(function(pageRange){
                            var myPage = duplicadosResult.fetch({index: pageRange.index});
                            myPage.data.forEach(function(result){
                                let internalId = result.getValue({name: 'internalid'});
                                let clienteId = result.getValue({name: 'custrecord_efx_lealtad_clienterelsocio'});
                                let clienteText = result.getText({name: 'custrecord_efx_lealtad_clienterelsocio'});
                                let tarjetaId = result.getValue({name: 'custrecord_efx_lealtad_numtarjetasocio'});
                                let tarjetaText = result.getText({name: 'custrecord_efx_lealtad_numtarjetasocio'});
                                let socioNumer = result.getValue({name: 'custrecord_efx_lealtad_socionumerodesoci'});
                                let socioFechaNacimiento = result.getValue({name: 'custrecord_efx_lealtad_sociofechanacimie'});
                                let clienteRfc = result.getValue({
                                    name: "custentity_mx_rfc",
                                    join: "CUSTRECORD_EFX_LEALTAD_CLIENTERELSOCIO",
                                    label: "RFC"
                                });
                                let socioMiembroDesde = result.getValue({name: 'custrecord_efx_lealtad_miembrodesde'});
                                let socioNombre = result.getValue({name: 'name'});
                                dataFound.push({idSocio: internalId, clienteId: clienteId, clienteText: clienteText, clienteRfc: clienteRfc, tarjetaId: tarjetaId, tarjetaText: tarjetaText, socio: socioNumer, socioNacimiento: socioFechaNacimiento, socioNombre: socioNombre, socioDesde: socioMiembroDesde });
                            });
                        });
                        response.success = true;
                        response.result = dataFound;
                    }else{
                        response.success = false;
                        response.error = 'No existen duplicados con los datos ingresados';
                        log.debug({ title:'No existen duplicados', details:response.error });
                    }
                }else{
                    response.success = false;
                    response.error = 'No hay Socios con los datos ingresados';
                    log.debug({ title:'No hay Socios', details:response.error });
                }
            } catch (error) {
                log.error({title:'searchResults', details:error});
                response.success = false;
                response.error = error;
            }
            return response;
        }

        function setResults(form, datos) {
            const response = {success: false, error: ''};
            try {
                log.debug({ title:'datos by form', details:datos });
                var sublist = form.getSublist({ id: 'sublistid_pl_ut_results' });
                for (let resultLine = 0; resultLine < datos.length; resultLine++) {
                    if (datos[resultLine].tarjetaId) {
                        var tarjetaLink = url.resolveRecord({ recordType: 'customrecord_efx_lealtad_tarjetalealtad', recordId: datos[resultLine].tarjetaId, isEditMode: false });
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_card_num', line: resultLine, value: "<a href=" + tarjetaLink + ">" + datos[resultLine].tarjetaText + "</a>" });
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_card_num_id', line: resultLine, value: datos[resultLine].tarjetaId });
                    }
                    if (datos[resultLine].clienteId) {
                        var clienteLink = url.resolveRecord({ recordType: 'customer', recordId: datos[resultLine].clienteId, isEditMode: false });
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_client_name', line: resultLine, value: "<a href=" + clienteLink + ">" + datos[resultLine].clienteText + "</a>" });
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_client_name_id', line: resultLine, value: datos[resultLine].clienteId });
                    }
                    if (datos[resultLine].idSocio) {
                        var socioLink = url.resolveRecord({ recordType: 'customrecord_efx_lealtad_socios', recordId: datos[resultLine].idSocio, isEditMode: false });
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_partner', line: resultLine, value: "<a href=" + socioLink + ">" + datos[resultLine].socioNombre + "</a>" });
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_partner_id', line: resultLine, value: datos[resultLine].idSocio });
                    }
                    if (datos[resultLine].socioNacimiento) {
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_partner_birthday', line: resultLine, value: datos[resultLine].socioNacimiento});
                    }
                    if (datos[resultLine].clienteRfc) {
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_client_rfc', line: resultLine, value: datos[resultLine].clienteRfc});
                    }
                    if (datos[resultLine].socioDesde) {
                        sublist.setSublistValue({ id: 'fieldid_pl_ut_partner_desde', line: resultLine, value: datos[resultLine].socioDesde});
                    }
                }
            } catch (error) {
                log.error({ title:'setResult', details:error });
                response.success =  false;
                response.error = error;
            }
            return response;
        }

        function createUnifyRecord(datos) {
            const response = {success: false, error: '', recordId: ''};
            try {
                log.debug({ title:'Datos recibidos', details:datos });
                let unifyRecord = record.create({
                    type: 'customrecord_fb_pl_unify_record',
                    isDynamic: true
                });
                let sociosAUnificar = [];
                let tarjetasAUnificar = [];
                let clientesAUnificar = [];
                for (let line = 0; line < datos.length; line++) {
                    let lineDat = datos[line];
                    log.debug({ title:'lineDat', details:lineDat });
                    if (lineDat.master == true) { // información de registro maestro
                        unifyRecord.setValue({
                            fieldId: 'custrecord_fb_pl_uni_rec_master_rec',
                            value: lineDat.socio
                        });
                        unifyRecord.setValue({
                            fieldId: 'custrecord_fb_pl_uni_rec_master_tarj',
                            value: lineDat.tarjeta
                        });
                        unifyRecord.setValue({
                            fieldId: 'custrecord_fb_pl_uni_rec_master_customer',
                            value: lineDat.cliente
                        });
                    }else if(lineDat.select == true){ // información de registros a unificar
                        sociosAUnificar.push(lineDat.socio);
                        tarjetasAUnificar.push(lineDat.tarjeta);
                        clientesAUnificar.push(lineDat.cliente);
                    }
                }
                unifyRecord.setValue({
                    fieldId: 'custrecord_fb_pl_uni_rec_unify_rec',
                    value: sociosAUnificar
                });
                unifyRecord.setValue({
                    fieldId: 'custrecord_fb_pl_uni_rec_unify_tarj',
                    value: tarjetasAUnificar
                });
                unifyRecord.setValue({
                    fieldId: 'custrecord_fb_pl_uni_rec_unify_cust',
                    value: clientesAUnificar
                });
                // var regCreate = 2
                var regCreate = unifyRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                if (regCreate) {
                    response.success = true;
                    response.recordId = regCreate;
                }
            } catch (error) {
                log.error({ title:'createUnifyRecord', details:error });
                response.success = false;
                response.error = error;
            }
            return response;
        }

        const errForm = (details) =>{
            try {
                var form = serverWidget.createForm({
                    title: "Unificación de tarjetas"
                });
                var htmlfld = form.addField({
                    id: "custpage_msg_error",
                    label: " ",
                    type: serverWidget.FieldType.INLINEHTML
                });
                htmlfld.defaultValue = '<b>HA OCURRIDO UN ERROR; CONTACTE A SUS ADMINISTRADORES.</b>' +
                    '<br>Detaller:</br>' + JSON.stringify(details);
                return form;
            } catch (error) {
                log.error({ title: 'errForm error', details: error });
            }
        }

        return {onRequest}

    });
