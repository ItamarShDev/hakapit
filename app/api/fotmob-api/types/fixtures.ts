export type Fixtures = Fixture[];
export type Fixture = {
    id?:                string;
    pageUrl?:           string;
    opponent?:          Away;
    home?:              Away;
    away?:              Away;
    displayTournament?: boolean;
    notStarted?:        boolean;
    tournament?:        Tournament;
    status?:            Status;
}

export type Away = {
    id?:    string;
    name?:  Name;
    score?: number;
}

export type Name = string;

export type Status = {
    utcTime?:   Date;
    finished?:  boolean;
    started?:   boolean;
    cancelled?: boolean;
    scoreStr?:  string;
    reason?:    Reason;
}

export type Reason = {
    short?:    Short;
    shortKey?: ShortKey;
    long?:     Long;
    longKey?:  LongKey;
}

export type Long = "Full-Time" | "Abandoned";

export type LongKey = "finished" | "aborted";

export type Short = "FT" | "Ab";

export type ShortKey = "fulltime_short" | "aborted_short";

export type Tournament = {
}
