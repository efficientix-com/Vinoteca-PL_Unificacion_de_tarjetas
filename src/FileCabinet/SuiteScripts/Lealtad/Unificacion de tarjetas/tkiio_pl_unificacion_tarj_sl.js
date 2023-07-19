/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/ui/serverWidget'],
    /**
 * @param{log} log
 * @param{serverWidget} serverWidget
 */
    (log, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                var form = createInterface(scriptContext.request.parameters);//Create the interface
                scriptContext.response.writePage({ pageObject: form });
            } catch (error) {
                log.error({title: 'error onRequest: ', details: error});
            }
        }

        /**
         * @summary Funtion that create the interface in netsuite
         * @returns The interface
         */
        const createInterface = (params) =>{
            try {
                
                let form = serverWidget.createForm({
                    title: 'Unificación de Tarjetas'
                });

                // form.clientScriptModulePath = './tkiio_pl_liberacion_ticket_cs.js';
                var fieldgroup = form.addFieldGroup({
                    id: "fieldgroup_pl_filters",     
                    label: 'Filtros'
                });
                /** Filters Fields */
                let btnFiltrar = form.addButton({
                    id: "button_pl_ut_filtrar",
                    label: 'Filtrar',
                    // functionName: 'search_tickets'                
                });

                let btnUnificar = form.addButton({
                    id: "button_pl_ut_unificar",
                    label: 'Unificar',
                    // functionName: 'search_tickets'                
                });

                form.addField({
                    id: "custpage_pl_ut_cred_num" ,
                    type: serverWidget.FieldType.SELECT,
                    label: "Número Socio",
                    source: 'customrecord_efx_lealtad_tarjetalealtad',
                    container: "fieldgroup_pl_filters"
                });

                form.addField({
                    id: "custpage_pl_ut_name_socio",
                    type: serverWidget.FieldType.TEXT,
                    label: "Nombre Socio",
                    container: "fieldgroup_pl_filters"
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                form.addField({
                    id: "custpage_pl_ut_birthdate",
                    type: serverWidget.FieldType.DATE,
                    label: "Fecha de Nacimiento DD/MM/YYYY",
                    container: "fieldgroup_pl_filters"
                });

                 //Create the sublist
                 var sublist = form.addSublist({
                    id: 'sublistid_pl_ut_results',
                    type: serverWidget.SublistType.LIST,
                    label: 'Resultados'
                });

                var checkSelect = sublist.addField({
                    id: "fieldid_pl_ut_check_select",
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Check selección'
                });

                var checkMaster = sublist.addField({
                    id: "fieldid_pl_ut_check_select_mast",
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Registro Maestro'
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
                log.error({ title: '*Error on createInterface', details: error });
                var formerror = errForm(error);
                scriptContext.response.writePage({
                    pageObject: formerror
                })
            }
        }

        return {onRequest}

    });
