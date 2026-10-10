package apperrors

type ValidationErrors map[string]string

func (e ValidationErrors) Error() string {
	for _, message := range e {
		return message
	}

	return "validation failed"
}
