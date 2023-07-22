"use strict";

//=============================================================================
//=============================================================================
function _ScoreboardUpdater_SetTextSafe( panel, childName, textValue )
{
	if ( panel === null )
		return;
	var childPanel = panel.FindChildInLayoutFile( childName )
	if ( childPanel === null )
		return;
	
	childPanel.text = textValue;
}


//=============================================================================
//=============================================================================
function _ScoreboardUpdater_UpdatePlayerPanel( scoreboardConfig, playersContainer, playerId, localPlayerTeamId )
{
	var playerPanelName = "_dynamic_player_" + playerId;
//	$.Msg( playerPanelName );
	var playerPanel = playersContainer.FindChild( playerPanelName );
	if ( playerPanel === null )
	{
		playerPanel = $.CreatePanel( "Panel", playersContainer, playerPanelName );
		playerPanel.SetAttributeInt( "player_id", playerId );
		playerPanel.BLoadLayout( scoreboardConfig.playerXmlName, false, false );
	}

	playerPanel.SetHasClass( "is_local_player", ( playerId == Game.GetLocalPlayerID() ) );
	
	var ultStateOrTime = PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_HIDDEN; // values > 0 mean on cooldown for that many seconds
	var goldValue = -1;
	var isTeammate = false;

	var playerInfo = Game.GetPlayerInfo( playerId );
	if ( playerInfo )
	{
		isTeammate = ( playerInfo.player_team_id == localPlayerTeamId );
		if ( isTeammate )
		{
			ultStateOrTime = Game.GetPlayerUltimateStateOrTime( playerId );
		}
		goldValue = playerInfo.player_gold;
		
		playerPanel.SetHasClass( "player_dead", ( playerInfo.player_respawn_seconds >= 0 ) );
		playerPanel.SetHasClass( "local_player_teammate", isTeammate && ( playerId != Game.GetLocalPlayerID() ) );

		var RespawnIndicator = playerPanel.FindChildInLayoutFile( "RespawnIndicator" );
		if ( RespawnIndicator ) {
			if (Players.CanPlayerBuyback( playerId ) && isTeammate) {
				RespawnIndicator.style.backgroundImage = 'url("s2r://panorama/images/hud/reborn/top_bar_buyback_bg_psd.vtex")';
				var BuyBackPanel = playerPanel.FindChildInLayoutFile( "BuyBackPanel" );
				var BuyBackPanelHas = playerPanel.FindChildInLayoutFile( "BuyBackHas" );
				if ( BuyBackPanel ) {
					BuyBackPanel.style.visibility = "visible"
				}
				if ( BuyBackPanelHas ) {
					BuyBackPanelHas.style.visibility = "visible"
				}
			} else {
				RespawnIndicator.style.backgroundImage = 'url("	")';
				var BuyBackPanel = playerPanel.FindChildInLayoutFile( "BuyBackPanel" );
				var BuyBackPanelHas = playerPanel.FindChildInLayoutFile( "BuyBackHas" );
				if ( BuyBackPanel ) {
					BuyBackPanel.style.visibility = "collapse"
				}
				if ( BuyBackPanelHas ) {
					BuyBackPanelHas.style.visibility = "collapse"
				}
			}
		}

		if ( Players.GetLastBuybackTime( playerId ) != 0 )
		{
			if (!GameUI.IsAltDown()) {
				var Buybacknulsa = playerPanel.FindChildInLayoutFile( "Buybacknulsa" );
				if ( Buybacknulsa )
				{
					if ( (Game.GetGameTime() - Players.GetLastBuybackTime( playerId )) <= 5 )
					{
						Buybacknulsa.style.opacity = "1"
					} else {
						Buybacknulsa.style.opacity = "0"
					}
				}
			} else {
				var Buybacknulsa = playerPanel.FindChildInLayoutFile( "Buybacknulsa" );
				if (Buybacknulsa) 
				{
					if ( (Game.GetGameTime() - Players.GetLastBuybackTime( playerId )) <= 60 )
					{
						Buybacknulsa.style.opacity = "1"
					} else {
						Buybacknulsa.style.opacity = "0"
					}
				}
			}
		}



		let selected_unit = Players.GetPlayerHeroEntityIndex( playerId )

		if (isTeammate) {
			if (Entities.GetHealthPercent( selected_unit ) > 0) {
				if (GameUI.IsAltDown()) {
					playerPanel.SetHasClass( "alt_health_check", true );
				} else {
					playerPanel.SetHasClass( "alt_health_check", false );
				}
			} else {
				playerPanel.SetHasClass( "alt_health_check", false );
			}
		}


		var CurrentHealth = playerPanel.FindChildInLayoutFile( "CurrentHealth" );
		if ( CurrentHealth ) {
			CurrentHealth.style['width'] = Entities.GetHealthPercent( selected_unit ) +'%';
		}

		var CurrentMana = playerPanel.FindChildInLayoutFile( "CurrentMana" );
		if ( CurrentMana ) {
			if (Entities.GetMana( selected_unit ) >= 0) {
				var percent = ((Entities.GetMaxMana( selected_unit )-Entities.GetMana( selected_unit ))*100)/Entities.GetMaxMana( selected_unit )
				if (percent >= 0) {
					CurrentMana.style['width'] = (100 - percent) +'%';
				} else {
					CurrentMana.style['width'] = '0%';
				}
			}
		}

		_ScoreboardUpdater_SetTextSafe( playerPanel, "RespawnTimer", ( playerInfo.player_respawn_seconds + 1 ) ); // value is rounded down so just add one for rounded-up
		_ScoreboardUpdater_SetTextSafe( playerPanel, "PlayerName", playerInfo.player_name );
		_ScoreboardUpdater_SetTextSafe( playerPanel, "Level", playerInfo.player_level );
		_ScoreboardUpdater_SetTextSafe( playerPanel, "Kills", playerInfo.player_kills );
		_ScoreboardUpdater_SetTextSafe( playerPanel, "Deaths", playerInfo.player_deaths );
		_ScoreboardUpdater_SetTextSafe( playerPanel, "Assists", playerInfo.player_assists );

		let table_skills = CustomNetTables.GetTableValue("table_skills", "thor"+playerId)
		if (table_skills && table_skills.anim == 1)
		{
			let effect = playerPanel.FindChildTraverse("ThorParticle")
			if (effect)
			{
				effect.style.opacity = 1
			}
		} else {
			let effect = playerPanel.FindChildTraverse("ThorParticle")
			if (effect)
			{
				effect.style.opacity = 0
			}
		}

		let table_skills_iron = CustomNetTables.GetTableValue("table_skills", "iron"+playerId)
		if (table_skills_iron && table_skills_iron.anim == 1) 
		{
			let effect = playerPanel.FindChildTraverse("IronParticle")
			if (effect) {
				effect.style.opacity = 1
			}
		} else {
			let effect = playerPanel.FindChildTraverse("IronParticle")
			if (effect) 
			{
				effect.style.opacity = 0
			}
		}
 
		

		var playerPortrait = playerPanel.FindChildInLayoutFile( "HeroIcon" );
		if ( playerPortrait )
		{
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
			}
			else
			{
				playerPortrait.SetImage( "file://{images}/custom_game/unassigned.png" );
			}
		}
		
		if ( playerInfo.player_selected_hero_id == -1 )
		{
			_ScoreboardUpdater_SetTextSafe( playerPanel, "HeroName", $.Localize( "#DOTA_Scoreboard_Picking_Hero" ) )
		}
		else
		{
			_ScoreboardUpdater_SetTextSafe( playerPanel, "HeroName", $.Localize( "#"+playerInfo.player_selected_hero ) )
		}
		
		var heroNameAndDescription = playerPanel.FindChildInLayoutFile( "HeroNameAndDescription" );
		if ( heroNameAndDescription )
		{
			if ( playerInfo.player_selected_hero_id == -1 )
			{
				heroNameAndDescription.SetDialogVariable( "hero_name", $.Localize( "#DOTA_Scoreboard_Picking_Hero" ) );
			}
			else
			{
				heroNameAndDescription.SetDialogVariable( "hero_name", $.Localize( "#"+playerInfo.player_selected_hero ) );
			}
			heroNameAndDescription.SetDialogVariableInt( "hero_level",  playerInfo.player_level );
		}		

		playerPanel.SetHasClass( "player_connection_abandoned", playerInfo.player_connection_state == DOTAConnectionState_t.DOTA_CONNECTION_STATE_ABANDONED );
		playerPanel.SetHasClass( "player_connection_failed", playerInfo.player_connection_state == DOTAConnectionState_t.DOTA_CONNECTION_STATE_FAILED );
		playerPanel.SetHasClass( "player_connection_disconnected", playerInfo.player_connection_state == DOTAConnectionState_t.DOTA_CONNECTION_STATE_DISCONNECTED );

		var playerAvatar = playerPanel.FindChildInLayoutFile( "AvatarImage" );
		if ( playerAvatar )
		{
			playerAvatar.steamid = playerInfo.player_steamid;
		}		

		var playerColorBar = playerPanel.FindChildInLayoutFile( "PlayerColorBar" );
		if ( playerColorBar !== null )
		{
			if ( GameUI.CustomUIConfig().team_colors )
			{
				var teamColor = GameUI.CustomUIConfig().team_colors[ playerInfo.player_team_id ];
				if ( teamColor )
				{
					playerColorBar.style.backgroundColor = teamColor;
				}
			}
			else
			{
				var playerColor = "#000000";
				playerColorBar.style.backgroundColor = playerColor;
			}
		}
	}
	
	var playerItemsContainer = playerPanel.FindChildInLayoutFile( "PlayerItemsContainer" );
	if ( playerItemsContainer )
	{
		var playerItems = Game.GetPlayerItems( playerId );
		if ( playerItems )
		{
	//		$.Msg( "playerItems = ", playerItems );
			for ( var i = playerItems.inventory_slot_min; i < playerItems.inventory_slot_max; ++i )
			{
				var itemPanelName = "_dynamic_item_" + i;
				var itemPanel = playerItemsContainer.FindChild( itemPanelName );
				if ( itemPanel === null )
				{
					itemPanel = $.CreatePanel( "Image", playerItemsContainer, itemPanelName );
					itemPanel.AddClass( "PlayerItem" );
				}

				var itemInfo = playerItems.inventory[i];
				if ( itemInfo )
				{
					var item_image_name = "file://{images}/items/" + itemInfo.item_name.replace( "item_", "" ) + ".png"
					if ( itemInfo.item_name.indexOf( "recipe" ) >= 0 )
					{
						item_image_name = "file://{images}/items/recipe.png"
					}
					itemPanel.SetImage( item_image_name );
				}
				else
				{
					itemPanel.SetImage( "" );
				}
			}
		}
	}

	if ( isTeammate )
	{
		_ScoreboardUpdater_SetTextSafe( playerPanel, "TeammateGoldAmount", goldValue );
	}

	_ScoreboardUpdater_SetTextSafe( playerPanel, "PlayerGoldAmount", goldValue );

	playerPanel.SetHasClass( "player_ultimate_ready", ( ultStateOrTime == PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_READY ) );
	playerPanel.SetHasClass( "player_ultimate_no_mana", ( ultStateOrTime == PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_NO_MANA) );
	playerPanel.SetHasClass( "player_ultimate_not_leveled", ( ultStateOrTime == PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_NOT_LEVELED) );
	playerPanel.SetHasClass( "player_ultimate_hidden", ( ultStateOrTime == PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_HIDDEN) );
	playerPanel.SetHasClass( "player_ultimate_cooldown", ( ultStateOrTime > 0 ) );
	_ScoreboardUpdater_SetTextSafe( playerPanel, "PlayerUltimateCooldown", ultStateOrTime );
}


//=============================================================================
//=============================================================================
function _ScoreboardUpdater_UpdateTeamPanel( scoreboardConfig, containerPanel, teamDetails, teamsInfo )
{
	if ( !containerPanel )
		return;

	var teamId = teamDetails.team_id;
//	$.Msg( "_ScoreboardUpdater_UpdateTeamPanel: ", teamId );

	var teamPanelName = "_dynamic_team_" + teamId;
	var teamPanel = containerPanel.FindChild( teamPanelName );
	if ( teamPanel === null )
	{
//		$.Msg( "UpdateTeamPanel.Create: ", teamPanelName, " = ", scoreboardConfig.teamXmlName );
		teamPanel = $.CreatePanel( "Panel", containerPanel, teamPanelName );
		teamPanel.SetAttributeInt( "team_id", teamId );
		teamPanel.BLoadLayout( scoreboardConfig.teamXmlName, false, false );

		var logo_xml = GameUI.CustomUIConfig().team_logo_xml;
		if ( logo_xml )
		{
			var teamLogoPanel = teamPanel.FindChildInLayoutFile( "TeamLogo" );
			if ( teamLogoPanel )
			{
				teamLogoPanel.SetAttributeInt( "team_id", teamId );
				teamLogoPanel.BLoadLayout( logo_xml, false, false );
			}
		}
	}
	
	var localPlayerTeamId = -1;
	var localPlayer = Game.GetLocalPlayerInfo();
	if ( localPlayer )
	{
		localPlayerTeamId = localPlayer.player_team_id;
	}
	teamPanel.SetHasClass( "local_player_team", localPlayerTeamId == teamId );
	teamPanel.SetHasClass( "not_local_player_team", localPlayerTeamId != teamId );

	var teamPlayers = Game.GetPlayerIDsOnTeam( teamId )
	var playersContainer = teamPanel.FindChildInLayoutFile( "PlayersContainer" );
//	$.Msg( playersContainer );
	if ( playersContainer )
	{
		for ( var playerId of teamPlayers )
		{
			_ScoreboardUpdater_UpdatePlayerPanel( scoreboardConfig, playersContainer, playerId, localPlayerTeamId )
		}
	}
	
	teamPanel.SetHasClass( "no_players", (teamPlayers.length == 0) )
	teamPanel.SetHasClass( "one_player", (teamPlayers.length == 1) )
	teamPanel.SetHasClass( "many_players", (teamPlayers.length > 5) )
	
	if ( teamsInfo.max_team_players < teamPlayers.length )
	{
		teamsInfo.max_team_players = teamPlayers.length;
	}

	_ScoreboardUpdater_SetTextSafe( teamPanel, "TeamScore", teamDetails.team_score )
	_ScoreboardUpdater_SetTextSafe( teamPanel, "TeamName", $.Localize( teamDetails.team_name ) )
	
	if ( GameUI.CustomUIConfig().team_colors )
	{
		var teamColor = GameUI.CustomUIConfig().team_colors[ teamId ];
		var teamColorPanel = teamPanel.FindChildInLayoutFile( "TeamColor" );
		
		teamColor = teamColor.replace( ";", "" );

		if ( teamColorPanel )
		{
			teamNamePanel.style.backgroundColor = teamColor + ";";
		}
		
		var teamColor_GradentFromTransparentLeft = teamPanel.FindChildInLayoutFile( "TeamColor_GradentFromTransparentLeft" );
		if ( teamColor_GradentFromTransparentLeft )
		{
			var gradientText = 'gradient( linear, 0% 0%, 800% 0%, from( #00000000 ), to( ' + teamColor + ' ) );';
//			$.Msg( gradientText );
			teamColor_GradentFromTransparentLeft.style.backgroundColor = gradientText;
		}
	}
	
	return teamPanel;
}

//=============================================================================
//=============================================================================
function _ScoreboardUpdater_UpdateAllTeamsAndPlayers( scoreboardConfig, teamsContainer )
{
	var teamsList = [];
	for ( var teamId of Game.GetAllTeamIDs() )
	{
		teamsList.push( Game.GetTeamDetails( teamId ) );
	}

	// update/create team panels
	var teamsInfo = { max_team_players: 0 };
	var panelsByTeam = [];
	for ( var i = 0; i < teamsList.length; ++i )
	{
		var teamPanel = _ScoreboardUpdater_UpdateTeamPanel( scoreboardConfig, teamsContainer, teamsList[i], teamsInfo );
		if ( teamPanel )
		{
			panelsByTeam[ teamsList[i].team_id ] = teamPanel;
		}
	}
}


//=============================================================================
//=============================================================================
function ScoreboardUpdater_InitializeScoreboard( scoreboardConfig, scoreboardPanel )
{
	GameUI.CustomUIConfig().teamsPrevPlace = [];
	if ( typeof(scoreboardConfig.shouldSort) === 'undefined')
	{
		// default to true
		scoreboardConfig.shouldSort = true;
	}
	_ScoreboardUpdater_UpdateAllTeamsAndPlayers( scoreboardConfig, scoreboardPanel );
	return { "scoreboardConfig": scoreboardConfig, "scoreboardPanel":scoreboardPanel }
}


//=============================================================================
//=============================================================================
function ScoreboardUpdater_SetScoreboardActive( scoreboardHandle, isActive )
{
	if ( scoreboardHandle.scoreboardConfig === null || scoreboardHandle.scoreboardPanel === null )
	{
		return;
	}
	
	if ( isActive )
	{
		_ScoreboardUpdater_UpdateAllTeamsAndPlayers( scoreboardHandle.scoreboardConfig, scoreboardHandle.scoreboardPanel );
	}
}

//=============================================================================
//=============================================================================
function ScoreboardUpdater_GetTeamPanel( scoreboardHandle, teamId )
{
	if ( scoreboardHandle.scoreboardPanel === null )
	{
		return;
	}
	
	var teamPanelName = "_dynamic_team_" + teamId;
	return scoreboardHandle.scoreboardPanel.FindChild( teamPanelName );
}

//=============================================================================
//=============================================================================
function ScoreboardUpdater_GetSortedTeamInfoList( scoreboardHandle )
{
	var teamsList = [];
	for ( var teamId of Game.GetAllTeamIDs() )
	{
		teamsList.push( Game.GetTeamDetails( teamId ) );
	}

	return teamsList;
}

