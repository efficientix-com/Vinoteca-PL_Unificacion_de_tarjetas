/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @name fb_pl_unificacion_tarj_record_UE
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Script para mostrar el boton de unificación de datos.
 * @copyright Tekiio México 2023
 * 
 * Client              -> Vinoteca
 * Last modification   -> 02/08/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> FB PL unificacion UE <customscript_fb_pl_unify_button_ue>
 */
define(['N/log'],
    /**
 * @param{log} log
 */
    (log) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            if (scriptContext.type == scriptContext.UserEventType.VIEW) {
                // scriptContext.form.clientScriptModulePath = './efx_lealtad_partnerManagePass_CS.js';
                let newRecord = scriptContext.newRecord;
                let recordState = newRecord.getValue({fieldId: 'custrecord_fb_pl_uni_rec_prin_state'});
                if (recordState == 1 || recordState == 4) {
                    let button_process = scriptContext.form.addButton({
                        id: 'custpage_unify_data',
                        label: 'Unificar datos',
                        functionName: 'unifyProcess' 
                    });
                }
            }
        }

        return {beforeLoad}

    });
