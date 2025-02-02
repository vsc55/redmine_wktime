$(function(){
	$('input[type=text]').blur();
	$( "#accordion" ).accordion({
		icons: { "header": "ui-icon-circle-triangle-e", "activeHeader": "ui-icon-circle-triangle-s" },
		collapsible: true,
		heightStyle: "content"
	});

	$('[id^=question_type_]').each(function(){
		question_type_changed(((this.name).split('_'))[2]);
	});

	if($('#survey_status').val() != 'O')
		$('.icon-email-add').hide();

	$('#survey_for').change(function(){
		$('#survey_for_id').val('');
	});

	validateSurveyFor();

	$('#survey_for_id, #survey_for').change(function(){
		validateSurveyFor();
	});

	$("#reminder-email-dlg").dialog({
		autoOpen: false,
		resizable: false,
		modal: true,
		width:	380,
		buttons: [
		{
			text: 'Ok',
			id: 'btnOk',
			click: function() {

				var email_notes = $('#email_notes').val();
				var survey_id = $('#survey_id').val();
				var user_group = $('#user_group').val();
				var includeUserGroup = $('#includeUserGroup').prop("checked");
				var additional_emails = $('#additional_emails').val();
				var isNotValid = false;

				if(additional_emails != ''){
					additional_emails = additional_emails.split(';');
					$.each(additional_emails, function( index, email ) {
						if(!validateEmail(email))
							isNotValid = true;
					});
				}

				if(isNotValid || (additional_emails == '' && !includeUserGroup)){
					alert('Validation failed');
					return false;
				}
				var url = '/wksurvey/email_user';
				$.ajax({
					url: url,
					type: 'get',
					data: { user_group: user_group, survey_id: survey_id, email_notes: email_notes, additional_emails: additional_emails,
							includeUserGroup: includeUserGroup},
					success: function(data){
						if(data != "ok") alert(data);
						$("#reminder-email-dlg").dialog("close");
					},
					error: function(xhr,status,error) {
						$('#email_notes').val('');
					},
					beforeSend: function(){
						$(this).parent().addClass('ajax-loading');
					},
					complete: function(){
						$(this).parent().removeClass('ajax-loading');
					}
				});
			}
		},
		{
			text: 'Cancel',
			id: 'btnCancel',
			click: function() {
				$( this ).dialog( "close" );
			}
		}]
	});

	showHideRecurEvery();
	$('#recur').change(function(){
		showHideRecurEvery();
	});

	$('#review').on('change', function(){
		if($('#review:checked').val())
			$('.revieweronly').show();
		else{
			$('.revieweronly').hide();
			$("input[id^='reviewerOnly_']").each(function(){
				$(this).prop("checked", false);
			});
		}
	});
	$('#review').trigger("change");

	$("#add-grp-name").dialog({
		autoOpen: false,
		resizable: false,
		modal: true,
		buttons: [
		{
			 text: 'Ok',
			 id: 'btnOk',
			 click: function(){
			$("#closedResp_form").submit();
			 }
		},
		{
			text: 'Cancel',
			id: 'btnCancel',
			click: function() {
				$( this ).dialog( "close" );
			}
		}]

	});

	//To render without choice question, append the choice next to question label
	$('[id^=tr_question_]').each(function(){
		const id = (this.id.split('_')).pop();
		if($('.tr_choice_'+id).length == 1 && $('.td_choice_name_'+id).text().length == 0)
			$(this).append($('.tr_choice_'+id).contents());
	});

	var radio = false;
	//Uncheck If single Radio button/Check box element present
		$("input:radio").mouseup(function(){
			radio = $(this).is(':checked');
		}).click(function(){
			if(radio) $(this).prop("checked", false);
		});
});

function addrows(qINDEX, qID)
{
	var lastEleName = $('[id^=questionChoices_'+ qID + '_'+ qINDEX +']').last().attr('name');
	var namearr = lastEleName.split("_");
	var cINDEX = parseInt(namearr[4]) + 1;
	var param = qINDEX +","+ (qID == '' ? -1 : qID) +","+ cINDEX +", -1"
	var newele = "<tr><td></td><td></td><td align='left'> <input type='text' name='questionChoices_"+ qID +'_'+ qINDEX +"__"+cINDEX+"' id='questionChoices_"+ qID +'_'+ qINDEX +"__"+cINDEX+"' size='40%' maxlength='255'/>&nbsp;<a title='Delete' href='javascript:deleterow("+ param +");'>"+delImg+" </a> </td><td align='right'><b>Points</b>&nbsp;<input type='text' name='points_"+ qID +'_'+ qINDEX +"__"+cINDEX+"' id='points_"+ qID +'_'+ qINDEX +"__"+cINDEX+"' size='5' maxlength='10'/></td></tr>";
	$("#lastrow_"+qINDEX).before(newele);
	$('#questionChoices_'+ qID +'_'+ qINDEX +'__'+cINDEX).focus();
}

function deleterow(qINDEX, qID, cINDEX, cID)
{

	cID = cID == '-1' ? '' : cID;
	qID = qID == '-1' ? '' : qID;

	if(cID != '' && qID != ''){
		$('#deleteChoiceIds_'+qINDEX).val(function(){
			if(this.value == ''){
				return cID;
			}
			return this.value + ',' + cID;
		});
	}
	$('#questionChoices_'+ qID +'_'+ qINDEX +'_'+cID+'_'+cINDEX).closest('tr').remove();
}

function addquestion()
{
	var clonedDiv = $('#add_question_template').html();
	if($(".surveyquestions").length > 1){
		var lastEleName = $('[id^=questionName_]').eq(-2).attr('name');
		var namearr = lastEleName.split("_");
		var qID = parseInt(namearr[2]) + 1;
	}
	else{
		var qID = $(".surveyquestions").length
	}
	clonedDiv = clonedDiv.replace(/\SINDEX/g,qID);
	clonedDiv = clonedDiv.replace(/\QINDEX/g,qID);
	$('#add_link').before(clonedDiv);
	reOrderIndex();
}

function deletequestion(qINDEX, qID)
{
	if(qID != ''){
		$('#delete_question_ids').val(function(){
			if(this.value == ''){
				return qID;
			}
			return this.value + ',' + qID;
		});
	}
	$('#QuestionID_'+ qINDEX ).remove();
	reOrderIndex();
}

function reOrderIndex(){

	$('.indexNo').each(function(index){
		$(this).html('<b>'+(index+1)+'.</b>');
	});
}

function question_type_changed(qIndex){
	var question_type = $('#question_type_'+qIndex).val();
	$('[id^=questionChoices_]').each(function(){
		var ele_index = ((this.name).split('_'))[2];
		var choice_id = ((this.name).split('_'))[3];
		var choice_index = ((this.name).split('_'))[4];
		var quesID = ((this.name).split('_'))[1];

		if((question_type == 'TB' || question_type == 'MTB') && ele_index == qIndex){
			$(this).parents('tr').hide();
			$('[id^=lastrow_'+qIndex+']').hide();
			if(!$('#lastColQuesType_'+qIndex).children().length){
				if($('#points_'+qIndex+':first').length){
					var clonedDiv = $('#points_'+qIndex+':first').html();
				}
				else{
					var clonedDiv = $('#points_QINDEX').html();
					clonedDiv = clonedDiv.replace(/\QINDEX/g,qIndex);
				}
				$('#lastColQuesType_'+qIndex).html(clonedDiv);
				$('#points_'+quesID+'_'+ele_index+'_'+choice_id+'_'+choice_index).attr('name','qpoints_'+qIndex);
				$('#points_'+quesID+'_'+ele_index+'_'+choice_id+'_'+choice_index).attr('id','qpoints_'+qIndex);
				$('#allowPoints_'+qIndex).val(true);
			}

			if(choice_id != ''){
				$('#deleteChoiceIds_' + qIndex).val(function(){
					var choice_IDs = (this.value).split(',');
					var return_value = this.value;

					if($.inArray(choice_id, choice_IDs) == -1){
							return_value = (return_value == '') ? choice_id : (return_value + ',' + choice_id);
					}
					return return_value;
				});
			}
			else{
				$(this).val('');
			}
		}
		else if(ele_index == qIndex){
			$(this).parents('tr').show();
			$('[id^=lastrow_'+qIndex+']').show();
			$('#lastColQuesType_'+qIndex).html("");

			if(choice_id != '' && $('#deleteChoiceIds_' + qIndex).val() != ''){
				$('#deleteChoiceIds_' + qIndex).val(function(){
					var choice_IDs = (this.value).split(',');
					var return_value = '';
					$.each(choice_IDs, function(index, choiceID){

						if(choice_id != choiceID)
							return_value = (return_value == '') ? choiceID : (return_value + ',' + choiceID);
					});
					return return_value;
				});
			}
		}
	});
}

function validateSurveyFor(){

	var surveyFor = $('#survey_for').val();
	var surveyForID = $('#survey_for_id').val();
	if(surveyForID != '' && surveyFor != ''){
	var URL = "/wksurvey/find_survey_for?surveyFor="+ surveyFor +"&surveyForID="+surveyForID+"&method=filter";
      $.ajax({
        url: URL,
		type: 'get',
		success: function(data){
			var result = data[0];
			if(data.length > 0){
				$('#SurveyFor').show();
				var label = '<b>' + result.label + '</b>';
				$('#SurveyFor').html(label);
				$('#IsSurveyForValid').val(true);
			}
			else{
				$('#SurveyFor').hide();
				$('#IsSurveyForValid').val(false);
			}
		}
	  });
	}
	else if(surveyForID == '' || surveyFor == ''){
				$('#SurveyFor').hide();
				$('#IsSurveyForValid').val(false);
	}
}

observeAutocompleteField('survey_for_id',	function(request, callback) {
		var url = "/wksurvey/find_survey_for?surveyFor="+ $('#survey_for').val() +"&surveyForID="+ $('#survey_for_id').val()+"&method=search";
		var data = {
			term: request.term
		};

		data['scope'] = 'all';

		$.get(url, data, null, 'json')
			.done(function(data){
				callback(data);
			})
			.fail(function(jqXHR, status, error){
				callback([]);
			});
	},
	{
		select: function(event, ui) {
			$('#SurveyFor').text('');
			$('#survey_for_id').val(ui.item.value).change();
		}
	}
);

function showConfirmationDlg(){

	$('#email_notes').val('');
	$('#additional_emails').val('');
	$( "#reminder-email-dlg" ).dialog( "open" );
}

function addGrpName(){
	$( "#add-grp-name" ).dialog( "open" );
}
function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailReg.test( $email );
}

function showHideRecurEvery(){
	if($("#recur").prop("checked")){
		$("#tr_recur_every").show();
		$("#recur_every").prop('required', true);
	}
	else{
		$("#tr_recur_every").hide();
		$("#recur_every").prop('required', false);
	}
}

function survey_submit(){
	$("[name^='survey_sel_choice_']").each(function(){
		$(this).prop('required', false);
	});
	$("#commit").val("Save");
	$("#survey_form").submit();
}

function validation(){
	var isUnAnswered = false;
	var checkBoxClass = null;
	$("[name^='survey_sel_choice_']:required").each(function(){
		switch(this.type) {
			// case "text":
			// 	if($(this).val() == ""){
			// 		isUnAnswered = true;
			// 		return false;
			// 	}
			// break;
			case "radio":
				if(!$.isNumeric($("input[name='"+this.name+"']:checked").val())){
					isUnAnswered = true;
					return false;
				}
			break;
			// case "textarea":
			// 	if($(this).val() == ""){
			// 		isUnAnswered = true;
			// 		return false;
			// 	}
			// break;
			case "checkbox":
				let answered = false;
				if(checkBoxClass != this.className){
					checkBoxClass = this.className;
					$("."+this.className).each(function(){
						answered = answered || this.checked;
					});
					if(!answered){
						isUnAnswered = true;
						return false;
					}
				}
			break;
			default:
				if($(this).val() == ""){
					isUnAnswered = true;
					return false;
				}
		}
	});

	if(!isUnAnswered && confirm(warn_survey_submit)){
		$("#commit").val("Submit");
		$("#survey_form").submit();
	}
	else if(isUnAnswered){
		alert(warn_survey_mandatory);
	}
}