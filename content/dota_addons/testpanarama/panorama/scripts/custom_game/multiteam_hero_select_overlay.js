"use strict";

function OnUpdateHeroSelection()
{
	for ( var teamId of Game.GetAllTeamIDs() )
	{
		UpdateTeam( teamId );
	}
}

function UpdateTeam( teamId )
{
	var teamPanelName = "team_" + teamId;
	var teamPanel = $( "#"+teamPanelName );
	var teamPlayers = Game.GetPlayerIDsOnTeam( teamId );
	teamPanel.SetHasClass( "no_players", ( teamPlayers.length == 0 ) );
	teamPanel.SetHasClass( "many_players", ( teamPlayers.length > 5 ) );
	for ( var playerId of teamPlayers )
	{
		UpdatePlayer( teamPanel, playerId );
	}
}

function UpdatePlayer( teamPanel, playerId )
{
	var playerContainer = teamPanel.FindChildInLayoutFile( "PlayersContainer" );
	var playerPanelName = "player_" + playerId;
	var playerPanel = playerContainer.FindChild( playerPanelName );
	if ( playerPanel === null )
	{
		playerPanel = $.CreatePanel( "Image", playerContainer, playerPanelName );
		playerPanel.BLoadLayout( "file://{resources}/layout/custom_game/multiteam_hero_select_overlay_player.xml", false, false );
		playerPanel.AddClass( "PlayerPanel" );
	}

	var playerInfo = Game.GetPlayerInfo( playerId );
	if ( !playerInfo )
		return;

	var localPlayerInfo = Game.GetLocalPlayerInfo();
	if ( !localPlayerInfo )
		return;

	var localPlayerTeamId = localPlayerInfo.player_team_id;
	var playerPortrait = playerPanel.FindChildInLayoutFile( "PlayerPortrait" );
	
	if ( playerId == localPlayerInfo.player_id )
	{
		playerPanel.AddClass( "is_local_player" );
	}

	if ( playerInfo.player_selected_hero !== "" )
	{
		let hero = playerInfo.player_selected_hero
		if (playerInfo.player_selected_hero == "npc_dota_hero_lycan")
		{
			hero = "wolf"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_bloodseeker")
		{
			hero = "flash"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_night_stalker")
		{
			hero = "batman"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_sniper")
		{
			hero = "dead"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_omniknight")
		{
			hero = "thor"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_rattletrap")
		{
			hero = "iron"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_dragon_knight")
		{
			hero = "super"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_broodmother")
		{
			hero = "spider"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_morphling")
		{
			hero = "aqua"
		}
		if (playerInfo.player_selected_hero == "npc_dota_hero_invoker")
		{
			hero = "strange"
		}
		playerPortrait.SetImage( "file://{images}/heroes/" + hero + ".png" );
		playerPanel.SetHasClass( "hero_selected", true );
		playerPanel.SetHasClass( "hero_highlighted", false );
	}
	else if ( playerInfo.possible_hero_selection !== "" && ( playerInfo.player_team_id == localPlayerTeamId ) )
	{
		let hero = "npc_dota_hero_" + playerInfo.possible_hero_selection
		if (playerInfo.possible_hero_selection == "lycan")
		{
			hero = "wolf"
		}
		if (playerInfo.possible_hero_selection == "bloodseeker")
		{
			hero = "flash"
		}
		if (playerInfo.possible_hero_selection == "night_stalker")
		{
			hero = "batman"
		}
		if (playerInfo.possible_hero_selection == "sniper")
		{
			hero = "dead"
		}
		if (playerInfo.possible_hero_selection == "omniknight")
		{
			hero = "thor"
		}
		if (playerInfo.possible_hero_selection == "rattletrap")
		{
			hero = "iron"
		}
		if (playerInfo.possible_hero_selection == "dragon_knight")
		{
			hero = "super"
		}
		if (playerInfo.possible_hero_selection == "broodmother")
		{
			hero = "spider"
		}
		if (playerInfo.possible_hero_selection == "morphling")
		{
			hero = "aqua"
		}
		if (playerInfo.possible_hero_selection == "invoker")
		{
			hero = "strange"
		}
		playerPortrait.SetImage( "file://{images}/heroes/" + hero + ".png" );
		playerPanel.SetHasClass( "hero_selected", false );
		playerPanel.SetHasClass( "hero_highlighted", true );
	}
	else
	{
		playerPortrait.SetImage( "file://{images}/custom_game/unassigned.png" );
	}

	var playerName = playerPanel.FindChildInLayoutFile( "PlayerName" );
	playerName.text = playerInfo.player_name;

	playerPanel.SetHasClass( "is_local_player", ( playerId == Game.GetLocalPlayerID() ) );
}

function UpdateTimer()
{

	let hud = $.GetContextPanel().GetParent().GetParent().GetParent()
	if (hud)
	{
		let DireTeamPlayers = hud.FindChildTraverse("DireTeamPlayers")
		if (DireTeamPlayers)
		{
			DireTeamPlayers.style.opacity = "0"
		}	
		let RadiantTeamPlayers = hud.FindChildTraverse("RadiantTeamPlayers")
		if (RadiantTeamPlayers)
		{
			RadiantTeamPlayers.style.opacity = "0"
		}
	}

	var gameTime = Game.GetGameTime();
	var transitionTime = Game.GetStateTransitionTime();
	$.Schedule( 0.1, UpdateTimer );
}

(function()
{
	var localPlayerTeamId = Game.GetLocalPlayerInfo().player_team_id;
	var first = true;
	var teamsContainer = $("#HeroSelectTeamsContainer");
	$.CreatePanel( "Panel", teamsContainer, "EndSpacer" );
	
	let puddle = 0

	for ( var teamId of Game.GetAllTeamIDs() )
	{
		puddle = puddle + 1

		if (puddle == 2)
		{
			$.CreatePanel( "Panel", teamsContainer, "Spacer" );
		}

		var teamPanelName = "team_" + teamId;
		var teamPanel = $.CreatePanel( "Panel", teamsContainer, teamPanelName );
		teamPanel.BLoadLayout( "file://{resources}/layout/custom_game/multiteam_hero_select_overlay_team.xml", false, false );
		var teamName = teamPanel.FindChildInLayoutFile( "TeamName" );
		if ( teamName )
		{
			teamName.text = $.Localize( Game.GetTeamDetails( teamId ).team_name );
		}

		var logo_xml = GameUI.CustomUIConfig().team_logo_xml;
		if ( logo_xml )
		{
			var teamLogoPanel = teamPanel.FindChildInLayoutFile( "TeamLogo" );
			teamLogoPanel.SetAttributeInt( "team_id", teamId );
			teamLogoPanel.BLoadLayout( logo_xml, false, false );
		}
		
		var teamGradient = teamPanel.FindChildInLayoutFile( "TeamGradient" );
		if ( teamGradient && GameUI.CustomUIConfig().team_colors )
		{
			teamGradient.style.opacity = "0"
		}

		if ( teamName )
		{
			teamName.text = $.Localize( Game.GetTeamDetails( teamId ).team_name );
		}
		teamPanel.AddClass( "TeamPanel" );

		if ( teamId === localPlayerTeamId )
		{
			teamPanel.AddClass( "local_player_team" );
		}
		else
		{
			teamPanel.AddClass( "not_local_player_team" );
		}
	}

	$.CreatePanel( "Panel", teamsContainer, "EndSpacer" );

	OnUpdateHeroSelection();
	GameEvents.Subscribe( "dota_player_hero_selection_dirty", OnUpdateHeroSelection );
	GameEvents.Subscribe( "dota_player_update_hero_selection", OnUpdateHeroSelection );

	UpdateTimer();
})();

