import StatusCard from '../../components/StatusCard/StatusCard'
import NotificationList from '../../components/NotificationList/NotificationList'
import { Users, Handshake, Calendar, FileText, Gift } from '../../assets/icons'
import './Pocetna.css'

const CURRENT_USER_NAME = 'Marko'

const STATUS_CARDS = [
  {
    id: 'ukupni-bodovi',
    title: 'Ukupni bodovi',
    value: 1240,
    unit: undefined,
    addition: { type: 'text', text: 'Automatski obračunato' },
  },
  {
    id: 'akademski-uspjeh',
    title: 'Akademski uspjeh',
    value: 680,
    unit: 'bodova',
    addition: { type: 'bar', value: 2, max: 3 },
  },
  {
    id: 'vannastavne',
    title: 'Vannastavne aktivnosti',
    value: 420,
    unit: 'bodova',
    addition: { type: 'icon', icon: <Users size={30} /> },
  },
  {
    id: 'drustveni',
    title: 'Društveni doprinos',
    value: 140,
    unit: 'bodova',
    addition: { type: 'icon', icon: <Handshake size={30} /> },
  },
]

const NOTIFICATIONS = [
  {
    id: 'notif-1',
    icon: <Calendar size={20} />,
    text: 'Dodjeljeni su bodovi za učenje na događaji',
  },
  {
    id: 'notif-2',
    icon: <FileText size={20} />,
    text: 'Objavljena je nova rang lista',
  },
  {
    id: 'notif-3',
    icon: <Gift size={20} />,
    text: 'Osvojili ste vaučer!',
  },
]

function Pocetna() {
  return (
    <div className="pocetna">
      <div className="pocetna__greeting">
        <h1 className="pocetna__greeting-title">
          Zdravo, {CURRENT_USER_NAME}! 👋
        </h1>
      </div>

      <section className="pocetna__status">
        <h2 className="pocetna__section-title">Tvoj trenutni status</h2>
        <div className="pocetna__cards-grid">
          {STATUS_CARDS.map((card) => (
            <StatusCard
              key={card.id}
              title={card.title}
              value={card.value}
              unit={card.unit}
              addition={card.addition}
            />
          ))}
        </div>
      </section>

      <section className="pocetna__notifications">
        <h2 className="pocetna__section-title">Najnovija obavještenja</h2>
        <NotificationList items={NOTIFICATIONS} />
      </section>
    </div>
  )
}

export default Pocetna
