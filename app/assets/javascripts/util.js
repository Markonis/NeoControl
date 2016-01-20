$(function(){

function resetDialog(){
	$("#nodeNameTxt").val("");
	$("#shortNodeNameTxt").val("");
	$("#nodeNameAlert").hide();
}

function resetEditDialog(){
	$("#editNodeNameAlert").hide();
}

$("#insertNodeDialog").on("hide.bs.modal", resetDialog);
$("#editNodeDialog").on("hide.bs.modal", resetEditDialog);

var saveNodeUtil = function(){
	if($("#shortNodeNameTxt").val().trim() != "" && $("#nodeNameTxt").val().trim() != ""){
		addNode();
		$("#insertNodeDialog").modal("hide");
	}else{
		if($("#nodeNameTxt").val().trim() == ""){
			$("#nodeNameTxt").focus();
			$("#nodeNameAlert").text("The name of the node is missing.");
		}else{
			$("#shortNodeNameTxt").focus();
			$("#nodeNameAlert").text("The short name of the node is missing.");
		}
		$("#nodeNameAlert").show();
	}
};

var editNodeUtil = function(){
	if($("#editShortNodeNameTxt").val().trim() != "" && $("#editNodeNameTxt").val().trim() != ""){
		editNode();
		$("#editNodeDialog").modal("hide");
	}else{
		if($("#editNodeNameTxt").val().trim() == ""){
			$("#editNodeNameTxt").focus();
			$("#editNodeNameAlert").text("The name of the node is missing.");
		}else{
			$("#editShortNodeNameTxt").focus();
			$("#editNodeNameAlert").text("The short name of the node is missing.");
		}
		$("#editNodeNameAlert").show();
	}
};

$("#snType").change(updateRequestSpan);
$("#snName").keyup(updateRequestSpan);
$("#snId").change(updateRequestSpan);
$("#enType").change(updateRequestSpan);
$("#enName").keyup(updateRequestSpan);
$("#enId").change(updateRequestSpan);

function updateRequestSpan(){
	var text = $("#snType").val() + "/";

	if($("#snId").val().trim() != "" && $("#snId").val().trim() != '0')
		text += $("#snId").val().trim() + "/";
	else if($("#snName").val().trim() != "")
		text += $("#snName").val().trim() + "/";

	$("#genRequestSpan").text(text);
}

});
