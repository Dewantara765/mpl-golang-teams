package models

type MatchStatus string

const (
	MatchScheduled MatchStatus = "scheduled"
	MatchLive      MatchStatus = "live"
	MatchCompleted MatchStatus = "completed"
	MatchCancelled MatchStatus = "cancelled"
	MatchPostponed MatchStatus = "postponed"
	MatchForfeit   MatchStatus = "forfeit"
)

type Match struct {
	ID         uint        `json:"id" gorm:"primaryKey"`
	HomeTeam   Team        `json:"home_team" gorm:"foreignKey:HomeTeamID"`
	HomeTeamID uint        `json:"home_team_id" gorm:"not null"`
	AwayTeam   Team        `json:"away_team" gorm:"foreignKey:AwayTeamID"`
	AwayTeamID uint        `json:"away_team_id" gorm:"not null"`
	HomeScore  *int        `json:"home_score"`
	AwayScore  *int        `json:"away_score"`
	Date       string      `json:"date" gorm:"type:date;not null"`
	Time       string      `json:"time" gorm:"type:time;not null"`
	BestOf     *int        `json:"best_of" gorm:"default:1"`
	Status     MatchStatus `json:"status"`
	EventID    uint        `json:"event_id" gorm:"not null" `
	Event      Event       `json:"event" gorm:"foreignKey:EventID"`
	Games      []Game      `json:"games" gorm:"foreignKey:MatchID"`
}
