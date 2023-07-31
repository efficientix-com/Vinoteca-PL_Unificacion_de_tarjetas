/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @name fb_pl_unificacion_tarj_CS
 * @version 1.0
 * @author Dylan Mendoza <dylan.mendoza@freebug.mx>
 * @summary Client Script encargado de las acciones del usuario en el formulario
 * @copyright Tekiio México 2023
 * 
 * Client              -> Vinoteca
 * Last modification   -> 20/07/2023
 * Modified by         -> Dylan Mendoza <dylan.mendoza@freebug.mx>
 * Script in NS        -> N/A <N/A>
 */
define(['N/search','N/currentRecord','N/format','N/ui/message','N/url'],

function(search, currentRecord, format, message, url) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        console.log('Start ClientScript');
        let currentRecord = scriptContext.currentRecord;
        let errors = currentRecord.getValue({ fieldId: 'custpage_pl_ut_errors' });
        if (errors) {
            var alertMessage = message.create({
                type: message.Type.WARNING,
                title: 'Precaución',
                message: errors,
                duration: 15000
            });
            alertMessage.show();
        }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

    }

    function filterData(params) {
        try {
            console.log('Inicio del filtrado de datos');
            var objRecord = currentRecord.get();
            let name = objRecord.getValue({ fieldId: 'custpage_pl_ut_name_socio' });
            let email = objRecord.getValue({ fieldId: 'custpage_pl_ut_email' });
            var birthday = objRecord.getValue({ fieldId: 'custpage_pl_ut_birthdate'});
            if (birthday) {
                birthday = new Date(birthday);
                birthday = format.format({
                    value:  birthday,
                    type: format.Type.DATE
                });
            }
            console.log({name: name, birthday: birthday, email: email});
            if (name || birthday || email) {
                var resolveUrl = url.resolveScript({
                    scriptId: 'customscript_tkiio_pl_unificacion_tarjet',
                    deploymentId: 'customdeploy_tkiio_pl_unificacion_tarjet',
                    returnExternalUrl: false,
                    params: {
                        'filtering': true,
                        'name': name,
                        'birthday':birthday,
                        'email': email
                        
                    }
                });
                window.open(resolveUrl, '_self');
            }else{
                var alertMessage = message.create({
                    type: message.Type.WARNING,
                    title: 'Precaución',
                    message: 'Asegurese de ingresar valores para al menos un filtro',
                    duration: 15000
                });
                alertMessage.show();
            }
        } catch (error) {
            console.error('Error filterData', error);
        }
    }

    function unifyData(params) {
        try {
            console.log('Inicio de la unificación de datos');
        } catch (error) {
            console.error('Error unifyData', error);
        }
    }

    return {
        pageInit: pageInit,
        filterData: filterData,
        unifyData: unifyData
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        // saveRecord: saveRecord
    };
    
});
