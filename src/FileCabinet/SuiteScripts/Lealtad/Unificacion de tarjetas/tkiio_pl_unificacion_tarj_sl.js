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
 * Last modification   -> 31/07/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> PL - Unificacion de tarjetas <customscript_tkiio_pl_unificacion_tarjet>
 */
define(['N/log', 'N/ui/serverWidget', 'N/search'],
    /**
 * @param{log} log
 * @param{serverWidget} serverWidget
 */
    (log, serverWidget, search) => {
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
                log.debug({title:'Start', details:params});
                if (!params.unify) { // Se crea la interfaz
                    var form = createInterface(params);
                }
                if (params.filtering) { // se agregan resultados filtrados a la interfaz
                    log.debug({title:'Datos', details:'filtrando'});
                    var searchResult = searchResults(params);
                    log.debug({title:'searchResult', details:searchResult});
                    if (searchResult.success == false) {
                        var errorField = form.getField({
                            id: 'custpage_pl_ut_errors'
                        });
                        errorField.defaultValue = searchResult.error;
                        scriptContext.response.writePage({ pageObject: form });
                    }
                }else{ // se muestra la interfaz en blanco
                    log.debug({title:'Creando', details:'Crenado interfaz'});
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

                var nameCard = sublist.addField({
                    id: "fieldid_pl_ut_client_name",
                    type: serverWidget.FieldType.TEXT,
                    label: 'Cliente'
                });

                var partner = sublist.addField({
                    id: "fieldid_pl_ut_partner",
                    type: serverWidget.FieldType.TEXT,
                    label: 'Socio'
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
                       search.createColumn({name: "custrecord_efx_lealtad_socionumerodesoci", label: "Número de socio de programa de lealtad"})
                    ]
                });
                var duplicadosResult = sociosDuplicadosSearch.runPaged({
                    pageSize: 1000
                });
                log.debug("Registros duplicados",duplicadosResult.count);
                if (duplicadosResult.count > 0) {
                    if (duplicadosResult.count > 1) {
                        log.debug({ title:'Duplicado encontrado', details:'Duplicado encontrado' });
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
