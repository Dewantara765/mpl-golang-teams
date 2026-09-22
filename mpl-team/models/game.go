package models

type Game struct {
	ID           uint  `json:"id" gorm:"primaryKey"`
	Match        Match `json:"match" gorm:"foreignKey:MatchID"`
	MatchID      uint  `json:"match_id" gorm:"not null;uniqueIndex:idx_match_game"`
	GameNumber   int   `json:"game_number" gorm:"not null;uniqueIndex:idx_match_game"`
	Duration     int   `json:"duration" gorm:"not null"`
	WinnerTeam   Team  `json:"winner_team" gorm:"foreignKey:WinnerTeamID"`
	WinnerTeamID uint  `json:"winner_team_id" gorm:"not null"`
}
