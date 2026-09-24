package models

type Standing struct {
	ID          uint  `json:"id" gorm:"primaryKey"`
	PhaseID     uint  `json:"phase_id" gorm:"not null"`
	Phase       Phase `json:"phase" gorm:"foreignKey:PhaseID"`
	TeamID      uint  `json:"team_id" gorm:"not null;uniqueIndex:idx_phase_team"`
	Team        Team  `json:"team" gorm:"foreignKey:TeamID"`
	MatchPlayed int   `json:"match_played" gorm:"not null"`
	MatchWin    int   `json:"match_win" gorm:"not null"`
	MatchLose   int   `json:"match_lose" gorm:"not null"`
	GameWin     int   `json:"game_win" gorm:"not null"`
	GameLose    int   `json:"game_lose" gorm:"not null"`
	GameDiff    int   `json:"game_diff" gorm:"not null"`
}
