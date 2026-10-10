package models

type HeroDraftType string

const (
	HeroDraftPick HeroDraftType = "pick"
	HeroDraftBan  HeroDraftType = "ban"
)

type HeroDraft struct {
	ID uint `json:"id" gorm:"primaryKey"`

	GameID uint `json:"game_id" gorm:"not null;uniqueIndex:idx_game_hero"`
	Game   Game `json:"game" gorm:"foreignKey:GameID"`

	TeamID uint `json:"team_id" gorm:"not null"`
	Team   Team `json:"team" gorm:"foreignKey:TeamID"`

	HeroID uint `json:"hero_id" gorm:"not null;uniqueIndex:idx_game_hero"`
	Hero   Hero `json:"hero" gorm:"foreignKey:HeroID"`

	Type HeroDraftType `json:"type" gorm:"type:enum('pick','ban');not null"`
}
